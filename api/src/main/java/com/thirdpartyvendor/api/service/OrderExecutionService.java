package com.thirdpartyvendor.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.client.MarketDataAPIClient;
import com.thirdpartyvendor.api.dto.MarketQuoteAPIResponse;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.entity.Holding;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Trade;
import com.thirdpartyvendor.api.repository.HoldingRepository;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.repository.TradeRepository;

import jakarta.transaction.Transactional;

@Service
public class OrderExecutionService {

    private final OrderRepository orderRepository;
    private final HoldingRepository holdingRepository;
    private final TradeRepository tradeRepository;
    private final CashHoldingsService cashHoldingsService;
    private final MarketDataAPIClient marketDataAPIClient;

    public OrderExecutionService(
        OrderRepository orderRepository,
        HoldingRepository holdingRepository,
        TradeRepository tradeRepository,
        CashHoldingsService cashHoldingsService,
        MarketDataAPIClient marketDataAPIClient
    ) {
        this.orderRepository = orderRepository;
        this.holdingRepository = holdingRepository;
        this.tradeRepository = tradeRepository;
        this.cashHoldingsService = cashHoldingsService;
        this.marketDataAPIClient = marketDataAPIClient;
    }

    @Transactional
    public OrderResponse executeOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderExecutionException("Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new OrderExecutionException("Order does not belong to the current user");
        }

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new OrderExecutionException("Cancelled orders cannot be executed");
        }

        Holding holding = loadExecutionHolding(order, userId);

        MarketQuoteAPIResponse quoteResponse = marketDataAPIClient.fetchQuote(order.getTicker());
        BigDecimal executionPrice = quoteResponse.data().price().setScale(4, RoundingMode.HALF_UP);

        BigDecimal executionQuantity = resolveExecutionQuantity(order, executionPrice);
        BigDecimal tradeAmount = resolveTradeAmount(order, executionQuantity, executionPrice);

        applyHoldingChange(order, holding, executionQuantity);

        cashHoldingsService.ensureCashHoldingExists(order.getOrderCurrency(), userId);
        applyCashChange(order, userId, tradeAmount);

        Trade trade = new Trade();
        trade.setOrderId(order.getId());
        trade.setExecutionPrice(executionPrice);
        trade.setExecutionQuantity(executionQuantity);
        trade.setTradeCurrency(order.getOrderCurrency());
        tradeRepository.save(trade);

        order.setStatus(Order.OrderStatus.EXECUTED);
        orderRepository.save(order);

        return new OrderResponse(
            order.getId(),
            order.getUserId(),
            order.getAssetId(),
            order.getTicker(),
            order.getOrderIntent(),
            order.getQuantity(),
            order.getOrderPrice(),
            order.getStatus(),
            order.getCreatedAt(),
            order.getOrderCurrency()
        );
    }

    private Holding loadExecutionHolding(Order order, Long userId) {
        return holdingRepository.findByTickerAndUserId(order.getTicker(), userId)
            .orElseGet(() -> {
                if (order.getOrderIntent() == Order.OrderIntent.SELL) {
                    throw new OrderExecutionException("Cannot sell an asset the user does not hold");
                }

                Holding newHolding = new Holding();
                newHolding.setAssetId(order.getAssetId());
                newHolding.setUserId(userId);
                newHolding.setSecurity(order.getTicker());
                newHolding.setTicker(order.getTicker());
                newHolding.setAssetType("UNKNOWN");
                newHolding.setNumShares(BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP));

                return holdingRepository.save(newHolding);
            });
    }

    private BigDecimal resolveExecutionQuantity(Order order, BigDecimal executionPrice) {
        if (order.getQuantity() != null) {
            return order.getQuantity().setScale(4, RoundingMode.HALF_UP);
        }

        return order.getOrderPrice().divide(executionPrice, 4, RoundingMode.HALF_UP);
    }

    private BigDecimal resolveTradeAmount(Order order, BigDecimal executionQuantity, BigDecimal executionPrice) {
        if (order.getQuantity() != null) {
            return executionQuantity.multiply(executionPrice).setScale(6, RoundingMode.HALF_UP);
        }

        return order.getOrderPrice().setScale(6, RoundingMode.HALF_UP);
    }

    private void applyHoldingChange(Order order, Holding holding, BigDecimal executionQuantity) {
        BigDecimal currentShares = holding.getNumShares();

        if (order.getOrderIntent() == Order.OrderIntent.BUY) {
            holding.setNumShares(currentShares.add(executionQuantity).setScale(4, RoundingMode.HALF_UP));
            holdingRepository.save(holding);
            return;
        }

        if (currentShares.compareTo(executionQuantity) < 0) {
            throw new OrderExecutionException("Insufficient shares to execute sell order");
        }

        holding.setNumShares(currentShares.subtract(executionQuantity).setScale(4, RoundingMode.HALF_UP));
        holdingRepository.save(holding);
    }

    private void applyCashChange(Order order, Long userId, BigDecimal tradeAmount) {
        if (order.getOrderIntent() == Order.OrderIntent.BUY) {
            cashHoldingsService.updateCashHolding(order.getOrderCurrency(), tradeAmount.negate(), userId);
            return;
        }

        cashHoldingsService.updateCashHolding(order.getOrderCurrency(), tradeAmount, userId);
    }

    public static class OrderExecutionException extends RuntimeException {
        public OrderExecutionException(String message) {
            super(message);
        }
    }
}
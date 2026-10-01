package com.thirdpartyvendor.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.client.MarketDataAPIClient;
import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.dto.MarketQuoteAPIResponse;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.entity.Holding;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Order.OrderStatus;
import com.thirdpartyvendor.api.error.CashExceptions.InsufficientCashException;
import com.thirdpartyvendor.api.error.OrderExceptions.OrderNotFoundException;
import com.thirdpartyvendor.api.repository.HoldingRepository;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.validator.OrderValidator;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderValidator orderValidator;
    private final HoldingRepository holdingRepository;
    private final CashHoldingsService cashHoldingsService;
    private final MarketDataAPIClient marketDataAPIClient;

    public OrderService(
        OrderRepository orderRepository,
        OrderValidator orderValidator,
        HoldingRepository holdingRepository,
        CashHoldingsService cashHoldingsService,
        MarketDataAPIClient marketDataAPIClient
    ) {
        this.orderRepository = orderRepository;
        this.orderValidator = orderValidator;
        this.holdingRepository = holdingRepository;
        this.cashHoldingsService = cashHoldingsService;
        this.marketDataAPIClient = marketDataAPIClient;
    }

    public OrderResponse createOrder(CreateOrderRequest createOrderRequest, Long userId) {
        orderValidator.validateCreateOrder(createOrderRequest, userId);
        validateOrderFunds(createOrderRequest, userId);

        Order newOrder = new Order();
        newOrder.setUserId(userId);
        newOrder.setAssetId(createOrderRequest.assetId());
        newOrder.setTicker(normalizeTicker(createOrderRequest.ticker()));
        newOrder.setOrderIntent(createOrderRequest.orderIntent());
        newOrder.setQuantity(createOrderRequest.quantity());
        newOrder.setOrderPrice(createOrderRequest.orderPrice());
        newOrder.setStatus(OrderStatus.PENDING);
        newOrder.setOrderCurrency(normalizeCurrency(createOrderRequest.orderCurrency()));

        Order savedOrder = orderRepository.save(newOrder);

        return new OrderResponse(
            savedOrder.getId(),
            savedOrder.getUserId(),
            savedOrder.getAssetId(),
            savedOrder.getTicker(),
            savedOrder.getOrderIntent(),
            savedOrder.getQuantity(),
            savedOrder.getOrderPrice(),
            savedOrder.getStatus(),
            savedOrder.getCreatedAt(),
            savedOrder.getOrderCurrency()
        );
    }

    private void validateOrderFunds(CreateOrderRequest request, Long userId) {
        MarketQuoteAPIResponse quoteResponse = marketDataAPIClient.fetchQuote(normalizeTicker(request.ticker()));
        BigDecimal quotePrice = quoteResponse.data().price().setScale(4, RoundingMode.HALF_UP);

        if (request.orderIntent() == Order.OrderIntent.BUY) {
            BigDecimal tradeAmount = resolveTradeAmount(request.quantity(), request.orderPrice(), quotePrice);
            cashHoldingsService.ensureSufficientCash(normalizeCurrency(request.orderCurrency()), tradeAmount, userId);
            return;
        }

        BigDecimal executionQuantity = resolveExecutionQuantity(request.quantity(), request.orderPrice(), quotePrice);
        Holding holding = holdingRepository.findByTickerAndUserId(normalizeTicker(request.ticker()), userId)
            .orElseThrow(() -> new InsufficientCashException("Insufficient shares to execute sell order"));

        if (holding.getNumShares().compareTo(executionQuantity) < 0) {
            throw new InsufficientCashException("Insufficient shares to execute sell order");
        }
    }

    private BigDecimal resolveExecutionQuantity(BigDecimal quantity, BigDecimal orderPrice, BigDecimal quotePrice) {
        if (quantity != null) {
            return quantity.setScale(4, RoundingMode.HALF_UP);
        }

        return orderPrice.divide(quotePrice, 4, RoundingMode.HALF_UP);
    }

    private BigDecimal resolveTradeAmount(BigDecimal quantity, BigDecimal orderPrice, BigDecimal quotePrice) {
        if (quantity != null) {
            return quantity.multiply(quotePrice).setScale(6, RoundingMode.HALF_UP);
        }

        return orderPrice.setScale(6, RoundingMode.HALF_UP);
    }

    private String normalizeCurrency(String orderCurrency) {
        return orderCurrency.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeTicker(String ticker) {
        return ticker.trim().toUpperCase(Locale.ROOT);
    }

    public List<OrderResponse> getOrders(Long userId) {
        return orderRepository.findByUserId(userId).stream()
            .map(order -> new OrderResponse(
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
            ))
            .collect(Collectors.toList());
    }

    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(userId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        order.setStatus(OrderStatus.CANCELLED);
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
}
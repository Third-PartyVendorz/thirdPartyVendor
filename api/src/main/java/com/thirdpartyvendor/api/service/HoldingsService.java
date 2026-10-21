package com.thirdpartyvendor.api.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.Map;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import com.thirdpartyvendor.api.repository.HoldingsRepository;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.repository.TradeRepository;
import com.thirdpartyvendor.api.dto.HoldingResponse;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Trade;

@Service
public class HoldingsService {
    private final HoldingsRepository holdingsRepository;
    private final OrderRepository orderRepository;
    private final TradeRepository tradeRepository;

    public HoldingsService(
        HoldingsRepository holdingsRepository,
        OrderRepository orderRepository,
        TradeRepository tradeRepository
    ) {
        this.holdingsRepository = holdingsRepository;
        this.orderRepository = orderRepository;
        this.tradeRepository = tradeRepository;
    }

    public List<HoldingResponse> getHoldings(Long userId) {
        Map<Long, Order> executedOrders = getExecutedOrders(userId);
        Map<Long, List<Trade>> tradesByOrder = getTradesByOrder(executedOrders);

        return holdingsRepository.findByUserId(userId).stream()
            .map(holding -> toResponse(holding, executedOrders, tradesByOrder))
            .collect(Collectors.toList());
    }

    public HoldingResponse getHoldingByTicker(Long userId, String ticker) {
        Map<Long, Order> executedOrders = getExecutedOrders(userId);
        Map<Long, List<Trade>> tradesByOrder = getTradesByOrder(executedOrders);

        return holdingsRepository.findByUserIdAndTicker(userId, ticker)
            .map(holding -> toResponse(holding, executedOrders, tradesByOrder))
            .orElseGet(() -> new HoldingResponse(
                userId,
                null,
                ticker,
                null,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO
            ));
    }

    private HoldingResponse toResponse(
        com.thirdpartyvendor.api.entity.Holding holding,
        Map<Long, Order> executedOrders,
        Map<Long, List<Trade>> tradesByOrder
    ) {
        PositionCost positionCost = calculatePositionCost(holding.getTicker(), executedOrders, tradesByOrder);

        return new HoldingResponse(
            holding.getUserId(),
            holding.getSecurity(),
            holding.getTicker(),
            holding.getAssetType(),
            holding.getNumShares(),
            positionCost.costBasis(),
            positionCost.realizedGainLoss()
        );
    }

    private Map<Long, Order> getExecutedOrders(Long userId) {
        return orderRepository.findByUserIdAndStatus(userId, Order.OrderStatus.EXECUTED).stream()
            .collect(Collectors.toMap(Order::getId, Function.identity()));
    }

    private Map<Long, List<Trade>> getTradesByOrder(Map<Long, Order> orders) {
        if (orders.isEmpty()) {
            return Map.of();
        }

        return tradeRepository.findByOrderIdIn(orders.keySet().stream().toList()).stream()
            .collect(Collectors.groupingBy(Trade::getOrderId));
    }

    private PositionCost calculatePositionCost(
        String ticker,
        Map<Long, Order> orders,
        Map<Long, List<Trade>> tradesByOrder
    ) {
        BigDecimal shares = BigDecimal.ZERO;
        BigDecimal costBasis = BigDecimal.ZERO;
        BigDecimal realizedGainLoss = BigDecimal.ZERO;

        List<Trade> trades = orders.values().stream()
            .filter(order -> ticker.equals(order.getTicker()))
            .flatMap(order -> tradesByOrder.getOrDefault(order.getId(), List.of()).stream())
            .sorted(Comparator.comparing(Trade::getTradeTimestamp))
            .toList();

        for (Trade trade : trades) {
            BigDecimal quantity = trade.getExecutionQuantity();
            BigDecimal executionValue = trade.getExecutionPrice().multiply(quantity);
            Order order = orders.get(trade.getOrderId());

            if (order.getOrderIntent() == Order.OrderIntent.BUY) {
                shares = shares.add(quantity);
                costBasis = costBasis.add(executionValue);
                continue;
            }

            if (order.getOrderIntent() == Order.OrderIntent.SELL && shares.signum() > 0) {
                BigDecimal averageCost = costBasis.divide(shares, 8, RoundingMode.HALF_UP);
                realizedGainLoss = realizedGainLoss.add(
                    trade.getExecutionPrice().subtract(averageCost).multiply(quantity)
                );
                costBasis = costBasis.subtract(averageCost.multiply(quantity));
                shares = shares.subtract(quantity);
            }
        }

        return new PositionCost(
            costBasis.max(BigDecimal.ZERO).setScale(4, RoundingMode.HALF_UP),
            realizedGainLoss.setScale(4, RoundingMode.HALF_UP)
        );
    }

    private record PositionCost(BigDecimal costBasis, BigDecimal realizedGainLoss) {}

}
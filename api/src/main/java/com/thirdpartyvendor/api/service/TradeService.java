package com.thirdpartyvendor.api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.dto.TradeResponse;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Trade;
import com.thirdpartyvendor.api.error.OrderExceptions.OrderNotFoundException;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.repository.TradeRepository;

@Service
public class TradeService {
    private final TradeRepository tradeRepository;
    private final OrderRepository orderRepository;

    public TradeService(TradeRepository tradeRepository, OrderRepository orderRepository) {
        this.tradeRepository = tradeRepository;
        this.orderRepository = orderRepository;
    }

    public List<TradeResponse> getTradesByUser(Long userId) {
        List<Order> userOrders = orderRepository.findByUserId(userId);
        List<Long> orderIds = userOrders.stream().map(Order::getId).collect(Collectors.toList());

        return tradeRepository.findAll().stream()
            .filter(trade -> orderIds.contains(trade.getOrderId()))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public TradeResponse getTradeById(Long tradeId) {
        Trade trade = tradeRepository.findById(tradeId)
            .orElseThrow(() -> new OrderNotFoundException("Trade not found"));
        
            return mapToResponse(trade);
    }

    private TradeResponse mapToResponse(Trade trade) {
        return new TradeResponse(
            trade.getTradeId(),
            trade.getOrderId(),
            trade.getExecutionPrice(),
            trade.getExecutionQuantity(),
            trade.getTradeTimestamp(),
            trade.getTradeCurrency()
        );
    }
}

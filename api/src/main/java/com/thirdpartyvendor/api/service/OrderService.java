package com.thirdpartyvendor.api.service;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.dto.OrderResponse;

import com.thirdpartyvendor.api.entity.Order;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository){
        this.orderRepository = orderRepository;
    }

    public List<OrderResponse> getOrders(Long userId) {
        return orderRepository.findByUserId(userId).stream().map(order -> new OrderResponse(
            order.getId(),
            order.getUserId(),
            order.getAssetId(),
            order.getOrderIntent(),
            order.getQuantity(),
            order.getOrderPrice(),
            order.getStatus(),
            order.getCreatedAt(),
            order.getOrderCurrency()
        )).collect(Collectors.toList());
    }





}
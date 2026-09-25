package com.thirdpartyvendor.api.service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Order.OrderStatus;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.validator.OrderValidator;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderValidator orderValidator;

    public OrderService(OrderRepository orderRepository, OrderValidator orderValidator) {
        this.orderRepository = orderRepository;
        this.orderValidator = orderValidator;
    }

    public OrderResponse createOrder(CreateOrderRequest createOrderRequest, Long userId) {
        orderValidator.validateCreateOrder(createOrderRequest, userId);

        Order newOrder = new Order();
        newOrder.setUserId(userId);
        newOrder.setAssetId(createOrderRequest.assetId());
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
            savedOrder.getOrderIntent(),
            savedOrder.getQuantity(),
            savedOrder.getOrderPrice(),
            savedOrder.getStatus(),
            savedOrder.getCreatedAt(),
            savedOrder.getOrderCurrency()
        );
    }

    private String normalizeCurrency(String orderCurrency) {
        return orderCurrency.trim().toUpperCase(Locale.ROOT);
    }

    public List<OrderResponse> getOrders(Long userId) {
        return orderRepository.findByUserId(userId).stream()
            .map(order -> new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getAssetId(),
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
            order.getOrderIntent(),
            order.getQuantity(),
            order.getOrderPrice(),
            order.getStatus(),
            order.getCreatedAt(),
            order.getOrderCurrency()
        );
    }

    public static class OrderNotFoundException extends RuntimeException {
        public OrderNotFoundException(String message) {
            super(message);
        }
    }
}
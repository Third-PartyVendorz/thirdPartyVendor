package com.thirdpartyvendor.api.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Order.OrderIntent;
import com.thirdpartyvendor.api.entity.Order.OrderStatus;
import com.thirdpartyvendor.api.model.Currency;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.validator.OrderValidator;

@Service
public class OrderService {

    private final CashHoldingsService cashHoldingsService;
    private final OrderRepository orderRepository;
    private final OrderValidator orderValidator;

    public OrderService(OrderRepository orderRepository, OrderValidator orderValidator, CashHoldingsService cashHoldingsService) {
        this.orderRepository = orderRepository;
        this.orderValidator = orderValidator;
        this.cashHoldingsService = cashHoldingsService;
    }

    public OrderResponse createOrder(CreateOrderRequest createOrderRequest, Long userId) {
        orderValidator.validateCreateOrder(createOrderRequest, userId);

        Currency currency = Currency.of(createOrderRequest.orderCurrency());
        BigDecimal totalRequired = createOrderRequest.orderPrice().multiply(createOrderRequest.quantity());
        
        if (createOrderRequest.orderIntent() == OrderIntent.BUY) {
            cashHoldingsService.validateSufficientCash(
                currency,
                totalRequired,
                userId
            );
        }

        Order newOrder = new Order();
        newOrder.setUserId(userId);
        newOrder.setAssetId(createOrderRequest.assetId());
        newOrder.setOrderIntent(createOrderRequest.orderIntent());
        newOrder.setQuantity(createOrderRequest.quantity());
        newOrder.setOrderPrice(createOrderRequest.orderPrice());
        newOrder.setStatus(OrderStatus.PENDING);
        newOrder.setOrderCurrency(currency.getCode());

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
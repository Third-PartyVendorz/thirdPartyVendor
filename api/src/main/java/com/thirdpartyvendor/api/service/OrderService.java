package com.thirdpartyvendor.api.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Order.OrderStatus;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.util.AuthorizationUtil;
import com.thirdpartyvendor.api.entity.AppUser;

@Service
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        // validation step
        if (request.quantity() == null && request.orderPrice() == null) {
            throw new IllegalArgumentException("Must provide either quantity or order price");
        }

        // create the order and assign fields
        Order order = new Order();
        order.setUserId(userId);
        order.setAssetId(request.assetId());
        order.setOrderIntent(request.orderIntent());
        order.setQuantity(request.quantity());
        order.setOrderPrice(request.orderPrice());
        order.setOrderCurrency(request.orderCurrency());
        order.setStatus(OrderStatus.PENDING);

        Order savedOrder = orderRepository.save(order);

        // make it a DTO 
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

    // returns all orders for a user
    public List<OrderResponse> getUserOrders(Long userId) {
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

    // returns just one order by id
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(
            () -> new IllegalArgumentException("Order not found"));
        
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

    // cancel order 
    public OrderResponse cancelOrder(Long orderId, AppUser currentUser) {
        Order order = orderRepository.findById(orderId).orElseThrow(
            () -> new IllegalArgumentException("ORDER NOT FOUND")
        );

        AuthorizationUtil.requireOwnUser(order.getUserId(), currentUser);

        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new IllegalArgumentException(
                "Can only cancel orders with status = PENDING"
            );
        }

        order.setStatus(OrderStatus.CANCELLED);

        Order savedOrder = orderRepository.save(order);

        // make it a DTO 
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
}
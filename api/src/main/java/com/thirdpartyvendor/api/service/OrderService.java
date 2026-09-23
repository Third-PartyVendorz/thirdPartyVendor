package com.thirdpartyvendor.api.service;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Order.OrderStatus;


@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderResponse createOrder(CreateOrderRequest createOrderRequest, Long userId) {
        Order newOrder = new Order();

        newOrder.setUserId(userId);
        newOrder.setAssetId(createOrderRequest.assetId());
        newOrder.setOrderIntent(createOrderRequest.orderIntent());
        newOrder.setQuantity(createOrderRequest.quantity());
        newOrder.setOrderPrice(createOrderRequest.orderPrice());
        newOrder.setStatus(OrderStatus.PENDING);
        newOrder.setOrderCurrency(createOrderRequest.orderCurrency());

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


}
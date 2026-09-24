package com.thirdpartyvendor.api.service;

import java.math.BigDecimal;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Order.OrderStatus;


import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.dto.OrderResponse;

import com.thirdpartyvendor.api.entity.Order;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderResponse createOrder(CreateOrderRequest createOrderRequest, Long userId) {
        validateInput(createOrderRequest, userId);

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

    private void validateInput(CreateOrderRequest request, Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user is required");
        }
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order request is required");
        }
        if (request.assetId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset id is required");
        }
        if (request.orderIntent() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order intent is required");
        }
		boolean hasQuantity = request.quantity() != null;
		boolean hasOrderPrice = request.orderPrice() != null;

		if (hasQuantity == hasOrderPrice) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exactly one of quantity or order price must be provided");
		}

		if (hasQuantity && request.quantity().compareTo(BigDecimal.ZERO) <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero");
		}
		if (hasOrderPrice && request.orderPrice().compareTo(BigDecimal.ZERO) <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order price must be greater than zero");
        }
        if (request.orderCurrency() == null || request.orderCurrency().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order currency is required");
        }
    }

    private String normalizeCurrency(String orderCurrency) {
        return orderCurrency.trim().toUpperCase(Locale.ROOT);
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
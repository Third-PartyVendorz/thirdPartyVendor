package com.thirdpartyvendor.api.service;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.repository.OrderRepository;

import com.thirdpartyvendor.api.entity.Order;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository){
        this.orderRepository = orderRepository;
    }

    public List<Order> getOrders(Long userId){
        return orderRepository.findByUserId(userId);
    }





}
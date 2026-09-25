package com.thirdpartyvendor.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.OrderService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping()
        public ResponseEntity<OrderResponse> createOrder(
            @RequestBody CreateOrderRequest createOrderRequest,
            @AuthenticationPrincipal AppUser currentUser
        ) {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(createOrderRequest, currentUser.getId()));
    }
  
    @GetMapping
    public List<OrderResponse> getOrders(@AuthenticationPrincipal AppUser currentUser) {
        return orderService.getOrders(currentUser.getId());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<OrderResponse> cancelOrder(
        @PathVariable Long id,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return ResponseEntity.ok(orderService.cancelOrder(id, currentUser.getId()));
    }
    

    
}

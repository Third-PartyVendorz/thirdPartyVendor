package com.thirdpartyvendor.api.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.service.OrderService;


@RestController
@RequestMapping("/orders")
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

@GetMapping
public List<Order> getOrders(@AuthenticationPrincipal Long userId) {
    return orderService.getOrders(userId);
}

    
}

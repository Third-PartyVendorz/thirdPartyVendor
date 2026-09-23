package com.thirdpartyvendor.api.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/orders")
public class OrderController {



//inject service here 

@GetMapping
public String getOrders() {
    return "List of orders";
}

    
}

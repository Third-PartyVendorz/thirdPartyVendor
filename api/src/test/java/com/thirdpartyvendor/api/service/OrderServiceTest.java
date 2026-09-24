package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;


import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.repository.OrderRepository;
import static org.mockito.Mockito.mock;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.dto.CreateOrderRequest;



class OrderServiceTest {

    private OrderRepository orderRepository;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        orderService = new OrderService(orderRepository);
    }

    //Get Orders Tests

    //Need to add tests in getOrders for quantity and price

    @Test
    @DisplayName("Test getOrders by userId returns correct orders")
    void testGetOrdersByUserId() {
        Long userId = 1L;
        Order order1 = new Order();
        order1.setId(1L);
        order1.setUserId(userId);
        order1.setAssetId(100L);
        order1.setOrderIntent(Order.OrderIntent.BUY);
        order1.setStatus(Order.OrderStatus.PENDING);
        
        Order order2 = new Order();
        order2.setId(2L);
        order2.setUserId(userId);
        order2.setAssetId(101L);
        order2.setOrderIntent(Order.OrderIntent.SELL);
        order2.setStatus(Order.OrderStatus.EXECUTED);

        when(orderRepository.findByUserId(userId)).thenReturn(Arrays.asList(order1, order2));
        
        List<OrderResponse> result = orderService.getOrders(userId);
        
        assertEquals(2, result.size());
        assertEquals(order1.getId(), result.get(0).orderId());
        assertEquals(order2.getId(), result.get(1).orderId());
        verify(orderRepository).findByUserId(userId);
    }

    @Test
    @DisplayName("Test that getOrders returns empty list for a user with no orders")
    void testgetOrdersReturnsEmptyWhenUserNoOrders(){
        Long userId = 1L;
        when(orderRepository.findByUserId(userId)).thenReturn(Arrays.asList());

        List<OrderResponse> result = orderService.getOrders(userId);

        assertTrue(result.isEmpty(), "List should be empty");

        verify(orderRepository).findByUserId(userId);
    }

    //Creat order tests

    //Validate succesful test --> Intended behavior
    @Test
    @DisplayName("Test createOrder successfully creates an order")
    void testCreateOrderSuccessfully() {

        CreateOrderRequest createOrderRequest = new CreateOrderRequest(
            100L,
            Order.OrderIntent.BUY,
            //Either quantity or order price must be null --> Include test for each
            null,
            BigDecimal.valueOf(500.0),
            "USD"
        );
        // createOrderRequest.setAssetId(100L);
        // createOrderRequest.setOrderIntent(Order.OrderIntent.BUY);
        // createOrderRequest.setQuantity(10);
        // createOrderRequest.setOrderPrice(500.0);
        // createOrderRequest.setOrderCurrency("USD");

        Order newOrder = new Order();

        Long userId = 1L;
        newOrder.setId(1L);
        newOrder.setUserId(userId);
        newOrder.setAssetId(createOrderRequest.assetId());
        newOrder.setOrderIntent(createOrderRequest.orderIntent());
        newOrder.setStatus(Order.OrderStatus.PENDING);



        when(orderRepository.save(any(Order.class))).thenReturn(newOrder);
        OrderResponse result = orderService.createOrder(createOrderRequest, userId);
        
        assertEquals(newOrder.getId(), result.orderId());
        verify(orderRepository).save(any(Order.class));
    }

    //Tests order creation with empty/missing fields
    // @Test
    // @DisplayName("Test createOrder with missing fields")
    // void testCreateOrderWithMissingFields() {
        
    // }

    // //Tests order creation with invalid fields
    // @Test
    // @DisplayName("Test createOrder with invalid fields")
    // void testCreateOrderWithInvalidFields() {
    //     // Implement the test logic for order creation with invalid fields here
    // }





}
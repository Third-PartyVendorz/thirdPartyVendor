package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Arrays;
import java.util.Optional;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.validator.OrderValidator;
import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.error.OrderExceptions.BadOrderException;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.validator.OrderValidator;

import static org.mockito.Mockito.mock;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.dto.CreateOrderRequest;


class OrderServiceTest {

    private OrderRepository orderRepository;
    private OrderValidator orderValidator;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        OrderValidator orderValidator = mock(OrderValidator.class);
        orderService = new OrderService(orderRepository, orderValidator);    }

    // ============= getOrders Tests =============

    @Test
    @DisplayName("Test getOrders returns all orders for a user")
    void testGetOrdersByUserId() {
        Long userId = 1L;
        Order order1 = new Order();
        order1.setId(1L);
        order1.setUserId(userId);
        order1.setAssetId(100L);
        order1.setOrderIntent(Order.OrderIntent.BUY);
        order1.setQuantity(BigDecimal.valueOf(10.0));
        order1.setStatus(Order.OrderStatus.PENDING);
        order1.setOrderCurrency("USD");
        
        Order order2 = new Order();
        order2.setId(2L);
        order2.setUserId(userId);
        order2.setAssetId(101L);
        order2.setOrderIntent(Order.OrderIntent.SELL);
        order2.setOrderPrice(BigDecimal.valueOf(500.0));
        order2.setStatus(Order.OrderStatus.EXECUTED);
        order2.setOrderCurrency("USD");

        when(orderRepository.findByUserId(userId)).thenReturn(Arrays.asList(order1, order2));
        
        List<OrderResponse> result = orderService.getOrders(userId);
        
        assertEquals(2, result.size());
        assertEquals(order1.getId(), result.get(0).orderId());
        assertEquals(order2.getId(), result.get(1).orderId());
        verify(orderRepository).findByUserId(userId);
    }

    @Test
    @DisplayName("Test getOrders returns empty list when user has no orders")
    void testGetOrdersReturnsEmptyList() {
        Long userId = 1L;
        when(orderRepository.findByUserId(userId)).thenReturn(Arrays.asList());

        List<OrderResponse> result = orderService.getOrders(userId);

        assertTrue(result.isEmpty());
        verify(orderRepository).findByUserId(userId);
    }

    @Test
    @DisplayName("Test getOrders preserves all order properties")
    void testGetOrdersPreservesOrderProperties() {
        Long userId = 1L;
        Long assetId = 100L;
        BigDecimal price = BigDecimal.valueOf(250.75);
        String currency = "EUR";
        
        Order order = new Order();
        order.setId(1L);
        order.setUserId(userId);
        order.setAssetId(assetId);
        order.setOrderIntent(Order.OrderIntent.BUY);
        order.setOrderPrice(price);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setOrderCurrency(currency);

        when(orderRepository.findByUserId(userId)).thenReturn(Arrays.asList(order));
        
        List<OrderResponse> result = orderService.getOrders(userId);
        OrderResponse response = result.get(0);
        
        assertEquals(1L, response.orderId());
        assertEquals(userId, response.userId());
        assertEquals(assetId, response.assetId());
        assertEquals(Order.OrderIntent.BUY, response.orderIntent());
        assertEquals(price, response.orderPrice());
        assertEquals(Order.OrderStatus.PENDING, response.status());
        assertEquals(currency, response.orderCurrency());
    }

    // // ============= createOrder Tests =============

    @Test
    @DisplayName("Test createOrder successfully with orderPrice")
    void testCreateOrderSuccessfullyWithOrderPrice() {
        CreateOrderRequest request = new CreateOrderRequest(
            100L,
            Order.OrderIntent.BUY,
            null,
            BigDecimal.valueOf(500.0),
            "USD"
        );

        Order savedOrder = new Order();
        savedOrder.setId(1L);
        savedOrder.setUserId(1L);
        savedOrder.setAssetId(100L);
        savedOrder.setOrderIntent(Order.OrderIntent.BUY);
        savedOrder.setOrderPrice(BigDecimal.valueOf(500.0));
        savedOrder.setStatus(Order.OrderStatus.PENDING);
        savedOrder.setOrderCurrency("USD");

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        OrderResponse result = orderService.createOrder(request, 1L);
        
        assertEquals(1L, result.orderId());
        assertEquals(Order.OrderStatus.PENDING, result.status());
        assertEquals("USD", result.orderCurrency());
        assertEquals(BigDecimal.valueOf(500.0), result.orderPrice());
        verify(orderValidator).validateCreateOrder(request, 1L);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Test createOrder successfully with quantity")
    void testCreateOrderSuccessfullyWithQuantity() {
        CreateOrderRequest request = new CreateOrderRequest(
            100L,
            Order.OrderIntent.SELL,
            BigDecimal.valueOf(25.5),
            null,
            "GBP"
        );

        Order savedOrder = new Order();
        savedOrder.setId(2L);
        savedOrder.setUserId(2L);
        savedOrder.setAssetId(100L);
        savedOrder.setOrderIntent(Order.OrderIntent.SELL);
        savedOrder.setQuantity(BigDecimal.valueOf(25.5));
        savedOrder.setStatus(Order.OrderStatus.PENDING);
        savedOrder.setOrderCurrency("GBP");

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        OrderResponse result = orderService.createOrder(request, 2L);
        
        assertEquals(2L, result.orderId());
        assertEquals(BigDecimal.valueOf(25.5), result.quantity());
        assertEquals(Order.OrderStatus.PENDING, result.status());
        assertEquals("GBP", result.orderCurrency());
        verify(orderValidator).validateCreateOrder(request, 2L);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Test createOrder normalizes currency to uppercase")
    void testCreateOrderNormalizesCurrencyToUppercase() {
        CreateOrderRequest request = new CreateOrderRequest(
            100L,
            Order.OrderIntent.BUY,
            BigDecimal.valueOf(10.0),
            null,
            "usd"
        );

        Order savedOrder = new Order();
        savedOrder.setId(3L);
        savedOrder.setUserId(3L);
        savedOrder.setAssetId(100L);
        savedOrder.setOrderIntent(Order.OrderIntent.BUY);
        savedOrder.setQuantity(BigDecimal.valueOf(10.0));
        savedOrder.setStatus(Order.OrderStatus.PENDING);
        savedOrder.setOrderCurrency("USD");

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        orderService.createOrder(request, 3L);
        
        BadOrderException exception = assertThrows(BadOrderException.class, () -> {
            orderService.createOrder(createOrderRequest, userId);
        });
        assertEquals("Order currency is required", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Test createOrder calls validator")
    void testCreateOrderCallsValidator() {
        CreateOrderRequest request = new CreateOrderRequest(
            100L,
            Order.OrderIntent.BUY,
            BigDecimal.valueOf(15.0),
            null,
            "EUR"
        );

        Order savedOrder = new Order();
        savedOrder.setId(4L);
        savedOrder.setUserId(4L);
        savedOrder.setAssetId(100L);
        savedOrder.setOrderIntent(Order.OrderIntent.BUY);
        savedOrder.setQuantity(BigDecimal.valueOf(15.0));
        savedOrder.setStatus(Order.OrderStatus.PENDING);
        savedOrder.setOrderCurrency("EUR");

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        orderService.createOrder(request, 4L);
        
        verify(orderValidator).validateCreateOrder(request, 4L);
    }

    // // ============= cancelOrder Tests =============

    @Test
    @DisplayName("Test cancelOrder successfully cancels an order")
    void testCancelOrderSuccessfully() {
        Long orderId = 5L;
        Long userId = 5L;

        Order order = new Order();
        order.setId(orderId);
        order.setUserId(userId);
        order.setAssetId(100L);
        order.setOrderIntent(Order.OrderIntent.BUY);
        order.setQuantity(BigDecimal.valueOf(5.0));
        order.setStatus(Order.OrderStatus.PENDING);
        order.setOrderCurrency("USD");

        when(orderRepository.findById(userId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse result = orderService.cancelOrder(orderId, userId);
        
        assertEquals(orderId, result.orderId());
        assertEquals(Order.OrderStatus.CANCELLED, result.status());
        verify(orderRepository).save(any(Order.class));
    }

}




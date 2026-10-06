package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.thirdpartyvendor.api.client.MarketDataAPIClient;
import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.dto.MarketQuoteAPIResponse;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.error.OrderExceptions.BadOrderException;
import com.thirdpartyvendor.api.repository.HoldingRepository;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.validator.OrderValidator;

class OrderServiceTest {

    private OrderRepository orderRepository;
    private OrderService orderService;
    private HoldingRepository holdingRepository;
    private CashHoldingsService cashHoldingsService;
    private MarketDataAPIClient marketDataAPIClient;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        holdingRepository = mock(HoldingRepository.class);
        cashHoldingsService = mock(CashHoldingsService.class);
        marketDataAPIClient = mock(MarketDataAPIClient.class);
        OrderValidator orderValidator = new OrderValidator();
        orderService = new OrderService(orderRepository, orderValidator, holdingRepository, cashHoldingsService, marketDataAPIClient);
    }

    @Test
    @DisplayName("Test getOrders returns all orders for a user")
    void testGetOrdersByUserId() {
        Long userId = 1L;
        Order order1 = new Order();
        order1.setId(1L);
        order1.setUserId(userId);
        order1.setAssetId(100L);
        order1.setTicker("AAPL");
        order1.setOrderIntent(Order.OrderIntent.BUY);
        order1.setQuantity(BigDecimal.valueOf(10.0));
        order1.setStatus(Order.OrderStatus.PENDING);

        Order order2 = new Order();
        order2.setId(2L);
        order2.setUserId(userId);
        order2.setAssetId(101L);
        order2.setTicker("TSLA");
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
    @DisplayName("Test that getOrders returns empty list for a user with no orders")
    void testGetOrdersReturnsEmptyWhenUserNoOrders() {
        Long userId = 1L;
        when(orderRepository.findByUserId(userId)).thenReturn(Arrays.asList());

        List<OrderResponse> result = orderService.getOrders(userId);

        assertTrue(result.isEmpty(), "List should be empty");
        verify(orderRepository).findByUserId(userId);
    }

    @Test
    @DisplayName("Test createOrder successfully creates an order")
    void testCreateOrderSuccessfully() {
        Mockito.when(marketDataAPIClient.fetchQuote("AAPL")).thenReturn(
            new MarketQuoteAPIResponse(
                new MarketQuoteAPIResponse.Data(
                    "AAPL",
                    new BigDecimal("100.00"),
                    null,
                    null,
                    null,
                    "USD",
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                null
            )
        );
    }

        CreateOrderRequest request = new CreateOrderRequest(
            100L,
            "AAPL",
            Order.OrderIntent.BUY,
            BigDecimal.valueOf(10.0),
            null,
            "USD"
        );

        Long userId = 1L;
        Order newOrder = new Order();
        newOrder.setId(1L);
        newOrder.setUserId(userId);
        newOrder.setAssetId(request.assetId());
        newOrder.setTicker(request.ticker());
        newOrder.setOrderIntent(request.orderIntent());
        newOrder.setQuantity(request.quantity());
        newOrder.setOrderPrice(request.orderPrice());
        newOrder.setOrderCurrency(request.orderCurrency());

        when(orderRepository.save(any(Order.class))).thenReturn(newOrder);

        OrderResponse result = orderService.createOrder(request, userId);

        assertEquals(newOrder.getId(), result.orderId());
        verify(orderRepository).save(any(Order.class));
        verify(marketDataAPIClient).fetchQuote("AAPL");
    }

    @Test
    @DisplayName("Test createOrder successfully with orderPrice")
    void testCreateOrderSuccessfullyWithOrderPrice() {
        CreateOrderRequest request = new CreateOrderRequest(
            100L,
            "AAPL",
            Order.OrderIntent.BUY,
            null,
            BigDecimal.valueOf(500.0),
            "USD"
        );

        Order newOrder = new Order();
        Long userId = 1L;
        newOrder.setId(1L);
        newOrder.setUserId(userId);
        newOrder.setAssetId(request.assetId());
        newOrder.setTicker(request.ticker());
        newOrder.setOrderIntent(request.orderIntent());
        newOrder.setQuantity(request.quantity());
        newOrder.setOrderPrice(request.orderPrice());
        newOrder.setOrderCurrency(request.orderCurrency());

        when(orderRepository.save(any(Order.class))).thenReturn(newOrder);

        OrderResponse result = orderService.createOrder(request, userId);

        assertEquals(newOrder.getId(), result.orderId());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Test createOrder with missing fields")
    void testCreateOrderWithMissingFields() {
        CreateOrderRequest createOrderRequest = new CreateOrderRequest(
            100L,
            "AAPL",
            Order.OrderIntent.BUY,
            BigDecimal.valueOf(10.0),
            null,
            "usd"
        );

        Long userId = 1L;

        BadOrderException exception = assertThrows(BadOrderException.class, () -> {
            orderService.createOrder(createOrderRequest, userId);
        });

        assertEquals("Order currency is required", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }
}

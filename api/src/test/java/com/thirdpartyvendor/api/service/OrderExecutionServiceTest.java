package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.thirdpartyvendor.api.client.MarketDataAPIClient;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.repository.HoldingRepository;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.repository.TradeRepository;

class OrderExecutionServiceTest {

    private OrderRepository orderRepository;
    private MarketDataAPIClient marketDataAPIClient;
    private OrderExecutionService orderExecutionService;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        HoldingRepository holdingRepository = mock(HoldingRepository.class);
        TradeRepository tradeRepository = mock(TradeRepository.class);
        CashHoldingsService cashHoldingsService = mock(CashHoldingsService.class);
        marketDataAPIClient = mock(MarketDataAPIClient.class);

        orderExecutionService = new OrderExecutionService(
            orderRepository,
            holdingRepository,
            tradeRepository,
            cashHoldingsService,
            marketDataAPIClient
        );
    }

    @Test
    void executeOrderRejectsFilledOrder() {
        Order order = orderWithStatus(Order.OrderStatus.FILLED);
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));

        assertThrows(
            OrderExecutionService.OrderExecutionException.class,
            () -> orderExecutionService.executeOrder(order.getId(), order.getUserId())
        );

        verify(marketDataAPIClient, never()).fetchQuote(order.getTicker());
    }

    @Test
    void executeOrderRejectsCancelledOrder() {
        Order order = orderWithStatus(Order.OrderStatus.CANCELLED);
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));

        assertThrows(
            OrderExecutionService.OrderExecutionException.class,
            () -> orderExecutionService.executeOrder(order.getId(), order.getUserId())
        );

        verify(marketDataAPIClient, never()).fetchQuote(order.getTicker());
    }

    private Order orderWithStatus(Order.OrderStatus status) {
        Order order = new Order();
        order.setId(10L);
        order.setUserId(20L);
        order.setTicker("AAPL");
        order.setStatus(status);
        return order;
    }
}

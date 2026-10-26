package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.thirdpartyvendor.api.client.MarketDataAPIClient;
import com.thirdpartyvendor.api.dto.MarketQuoteAPIResponse;
import com.thirdpartyvendor.api.entity.Holding;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.repository.HoldingRepository;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.repository.TradeRepository;

class OrderExecutionServiceTest {

    private OrderRepository orderRepository;
    private MarketDataAPIClient marketDataAPIClient;
    private OrderExecutionService orderExecutionService;
    private CashHoldingsService cashHoldingsService;
    private HoldingRepository holdingRepository;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        holdingRepository = mock(HoldingRepository.class);
        TradeRepository tradeRepository = mock(TradeRepository.class);
        cashHoldingsService = mock(CashHoldingsService.class);
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

    @Test
    void executeBuyOrderReleasesReservationAfterApplyingActualCost() {
        Order order = orderWithStatus(Order.OrderStatus.PENDING);
        order.setTicker("AAPL");
        order.setOrderIntent(Order.OrderIntent.BUY);
        order.setQuantity(new BigDecimal("2.0000"));
        order.setInstrumentPriceAtOrder(new BigDecimal("100.0000"));
        order.setOrderCurrency("USD");
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(marketDataAPIClient.fetchQuote("AAPL")).thenReturn(
            new MarketQuoteAPIResponse(
                new MarketQuoteAPIResponse.Data(
                    "AAPL",
                    new BigDecimal("90.0000"),
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
        when(holdingRepository.findByTickerAndUserId("AAPL", order.getUserId())).thenReturn(Optional.empty());
        when(holdingRepository.save(any(Holding.class))).thenAnswer(invocation -> invocation.getArgument(0));

        orderExecutionService.executeOrder(order.getId(), order.getUserId());

        verify(cashHoldingsService).ensureSufficientCashForReservedOrder(
            "USD",
            new BigDecimal("180.000000"),
            new BigDecimal("200.000000"),
            order.getUserId()
        );
        verify(cashHoldingsService).updateCashHolding("USD", new BigDecimal("-180.000000"), order.getUserId());
        verify(cashHoldingsService).releaseBuyingPower("USD", new BigDecimal("200.000000"), order.getUserId());
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

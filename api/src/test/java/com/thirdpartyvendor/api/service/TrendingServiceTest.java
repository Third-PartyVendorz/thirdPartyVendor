package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.thirdpartyvendor.api.dto.TrendingTickerResponse;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.error.OrderExceptions.BadOrderException;
import com.thirdpartyvendor.api.repository.OrderRepository;

class TrendingServiceTest {

    private OrderRepository orderRepository;
    private TrendingService trendingService;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        trendingService = new TrendingService(orderRepository);
    }

    @Test
    @DisplayName("Test getTrendingTickers returns the top k tickers by non-cancelled order count")
    void testGetTrendingTickersReturnsTopKByOrderCount() {
        Instant from = Instant.parse("2026-01-01T00:00:00Z");
        Instant to = Instant.parse("2026-01-02T00:00:00Z");
        LocalDateTime fromLocal = LocalDateTime.ofInstant(from, ZoneId.systemDefault());
        LocalDateTime toLocal = LocalDateTime.ofInstant(to, ZoneId.systemDefault());

        OrderRepository.TickerOrderCount aapl = mock(OrderRepository.TickerOrderCount.class);
        when(aapl.getTicker()).thenReturn("AAPL");
        when(aapl.getOrderCount()).thenReturn(7L);
        OrderRepository.TickerOrderCount msft = mock(OrderRepository.TickerOrderCount.class);
        when(msft.getTicker()).thenReturn("MSFT");
        when(msft.getOrderCount()).thenReturn(4L);
        OrderRepository.TickerOrderCount tsla = mock(OrderRepository.TickerOrderCount.class);
        when(tsla.getTicker()).thenReturn("TSLA");
        when(tsla.getOrderCount()).thenReturn(2L);

        when(orderRepository.findTickerOrderCounts(Order.OrderStatus.CANCELLED, fromLocal, toLocal))
            .thenReturn(List.of(aapl, msft, tsla));

        List<TrendingTickerResponse> result = trendingService.getTrendingTickers(from, to, 2);

        assertEquals(List.of(new TrendingTickerResponse("AAPL", 7L), new TrendingTickerResponse("MSFT", 4L)), result);
    }

    @Test
    @DisplayName("Test getTrendingTickers rejects k below 1")
    void testGetTrendingTickersRejectsInvalidK() {
        Instant from = Instant.parse("2026-01-01T00:00:00Z");
        Instant to = Instant.parse("2026-01-02T00:00:00Z");

        BadOrderException exception = assertThrows(BadOrderException.class,
            () -> trendingService.getTrendingTickers(from, to, 0));

        assertEquals("k must be at least 1", exception.getMessage());
        verify(orderRepository, never()).findTickerOrderCounts(any(), any(), any());
    }
}

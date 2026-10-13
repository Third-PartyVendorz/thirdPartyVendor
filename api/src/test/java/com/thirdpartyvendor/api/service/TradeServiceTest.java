package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Trade;
import com.thirdpartyvendor.api.error.AuthExceptions.ForbiddenException;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.repository.TradeRepository;

class TradeServiceTest {

    private final TradeRepository tradeRepository = mock(TradeRepository.class);
    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final TradeService tradeService = new TradeService(tradeRepository, orderRepository);

    @Test
    void rejectsTradeLookupForDifferentUser() {
        Trade trade = new Trade();
        trade.setTradeId(1L);
        trade.setOrderId(2L);

        Order order = new Order();
        order.setId(2L);
        order.setUserId(10L);

        when(tradeRepository.findById(1L)).thenReturn(Optional.of(trade));
        when(orderRepository.findById(2L)).thenReturn(Optional.of(order));

        assertThrows(ForbiddenException.class, () -> tradeService.getTradeById(1L, 20L));

        verify(orderRepository).findById(2L);
        verify(tradeRepository, never()).save(trade);
    }
}
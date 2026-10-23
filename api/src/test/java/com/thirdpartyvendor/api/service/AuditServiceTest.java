package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.thirdpartyvendor.api.dto.AuditEventResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.ForexLog;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Trade;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.repository.ForexLogRepository;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.repository.TradeRepository;

class AuditServiceTest {
    private final AppUserRepository userRepository = mock(AppUserRepository.class);
    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final TradeRepository tradeRepository = mock(TradeRepository.class);
    private final ForexLogRepository forexLogRepository = mock(ForexLogRepository.class);
    private final AuditService auditService = new AuditService(
        userRepository, orderRepository, tradeRepository, forexLogRepository);
    private final AppUser admin = new AppUser();
    private final Order order = new Order();
    private final Trade trade = new Trade();

    @BeforeEach
    void setUp() {
        admin.setId(1L);
        admin.setRole(AppUser.UserRole.ADMIN);
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        order.setId(2L);
        order.setUserId(1L);
        order.setTicker("AAPL");
        order.setOrderIntent(Order.OrderIntent.BUY);
        order.setStatus(Order.OrderStatus.FILLED);
        order.setQuantity(new BigDecimal("1.2345"));
        order.setInstrumentPriceAtOrder(new BigDecimal("123.4567"));
        order.setOrderCurrency("USD");
        when(orderRepository.findById(2L)).thenReturn(Optional.of(order));

        trade.setTradeId(3L);
        trade.setOrderId(2L);
        trade.setTicker("AAPL");
        trade.setExecutionQuantity(new BigDecimal("1.2345"));
        trade.setExecutionPrice(new BigDecimal("124.1250"));
        trade.setTradeCurrency("USD");
        when(tradeRepository.findById(3L)).thenReturn(Optional.of(trade));
        when(tradeRepository.findByOrderId(2L)).thenReturn(List.of(trade));
    }

    @Test
    void formatsOrderPricesInSummaryDetailsAndPricing() {
        AuditEventResponse event = auditService.findEvent("order", "2", admin);

        assertTrue(event.summary().contains("1.2345 AAPL"));
        assertTrue(event.summary().contains("Instrument price at order: 123.46 USD; Execution price: 124.13 USD"));
        assertTrue(event.details().contains("Requested quantity: 1.2345"));
        assertTrue(event.details().contains("Instrument price at order: 123.46 USD"));
        assertTrue(event.details().contains("Execution price: 124.13 USD"));
        assertEquals("Instrument price at order: 123.46 USD; Execution price: 124.13 USD", event.pricing());
        assertEquals(new BigDecimal("124.1250"), trade.getExecutionPrice());
    }

    @Test
    void formatsTradePricesConsistently() {
        AuditEventResponse event = auditService.findEvent("trade", "3", admin);

        assertTrue(event.details().contains("Instrument price at order: 123.46 USD"));
        assertTrue(event.details().contains("Execution price: 124.13 USD"));
        assertEquals("Instrument price at order: 123.46 USD; Execution price: 124.13 USD", event.pricing());
        assertEquals("1.2345 AAPL executed for the client.", event.summary());
    }

    @Test
    void padsWholePricesAndPreservesMissingPricePlaceholder() {
        order.setInstrumentPriceAtOrder(null);
        trade.setExecutionPrice(new BigDecimal("125"));
        trade.setTradeCurrency(null);

        AuditEventResponse event = auditService.findEvent("trade", "3", admin);

        assertTrue(event.details().contains("Instrument price at order: Not recorded"));
        assertTrue(event.details().contains("Execution price: 125.00"));
        assertEquals("Instrument price at order: Not recorded; Execution price: 125.00", event.pricing());
    }

    @Test
    void formatsPendingOrderValueWithoutChangingStoredAmount() {
        order.setQuantity(null);
        order.setOrderPrice(new BigDecimal("100.0050"));
        order.setInstrumentPriceAtOrder(BigDecimal.ZERO);
        order.setOrderCurrency("");
        when(tradeRepository.findByOrderId(2L)).thenReturn(List.of());

        AuditEventResponse event = auditService.findEvent("order", "2", admin);

        assertEquals("BUY order value of 100.01 recorded for AAPL.", event.summary());
        assertEquals("Instrument price at order: 0.00", event.pricing());
        assertTrue(event.details().contains("Execution price: Not recorded"));
        assertEquals(new BigDecimal("100.0050"), order.getOrderPrice());
    }

    @Test
    void formatsForexCashAmountsWithoutRoundingExchangeRate() {
        ForexLog exchange = new ForexLog();
        exchange.setExchangeId(4L);
        exchange.setUserId(1L);
        exchange.setFromCurrency("USD");
        exchange.setToCurrency("EUR");
        exchange.setFromAmount(new BigDecimal("100.000000"));
        exchange.setToAmount(new BigDecimal("92.345678"));
        exchange.setExchangeRate(new BigDecimal("0.92345678"));
        when(forexLogRepository.findById(4L)).thenReturn(Optional.of(exchange));

        AuditEventResponse event = auditService.findEvent("forex", "4", admin);

        assertEquals("100.00 USD exchanged for the client.", event.summary());
        assertTrue(event.details().contains("From amount: 100.00 USD"));
        assertTrue(event.details().contains("To amount: 92.35 EUR"));
        assertEquals("Cash -100.00 USD; cash +92.35 EUR", event.impact());
        assertEquals("Exchange rate: 0.92345678 EUR per USD", event.pricing());
    }
}

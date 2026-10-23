package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdpartyvendor.api.entity.CashHolding;
import com.thirdpartyvendor.api.repository.CashHoldingsRepository;
import com.thirdpartyvendor.api.repository.CashTransactionRepository;

class CashHoldingsServiceTest {

    private CashHoldingsRepository cashHoldingsRepository;
    private CashHoldingsService cashHoldingsService;

    @BeforeEach
    void setUp() throws IOException {
        cashHoldingsRepository = mock(CashHoldingsRepository.class);
        cashHoldingsService = new CashHoldingsService(
            new ObjectMapper(),
            cashHoldingsRepository,
            mock(CashTransactionRepository.class)
        );
    }

    @Test
    void reserveAndReleaseCashChangesBuyingPowerButNotBalance() {
        CashHolding holding = holding("1000.000000", "1000.000000");
        when(cashHoldingsRepository.findByUserIdAndCurrencyCodeForUpdate(7L, "USD"))
            .thenReturn(Optional.of(holding));

        cashHoldingsService.reserveCash("USD", new BigDecimal("250.000000"), 7L);

        assertEquals(new BigDecimal("1000.000000"), holding.getBalance());
        assertEquals(new BigDecimal("750.000000"), holding.getBuyingPower());

        cashHoldingsService.releaseReservedCash("USD", new BigDecimal("250.000000"), 7L);

        assertEquals(new BigDecimal("1000.000000"), holding.getBalance());
        assertEquals(new BigDecimal("1000.000000"), holding.getBuyingPower());
    }

    @Test
    void settlementRefundsUnusedReservationAndChargesPriceIncrease() {
        CashHolding holding = holding("1000.000000", "750.000000");
        when(cashHoldingsRepository.findByUserIdAndCurrencyCodeForUpdate(7L, "USD"))
            .thenReturn(Optional.of(holding));

        boolean settled = cashHoldingsService.settleReservedCash(
            "USD",
            new BigDecimal("250.000000"),
            new BigDecimal("270.000000"),
            7L
        );

        assertTrue(settled);
        assertEquals(new BigDecimal("730.000000"), holding.getBalance());
        assertEquals(new BigDecimal("730.000000"), holding.getBuyingPower());
        verify(cashHoldingsRepository).save(holding);
    }

    @Test
    void settlementLeavesReservationUntouchedWhenAdditionalBuyingPowerIsUnavailable() {
        CashHolding holding = holding("2000.000000", "200.000000");
        when(cashHoldingsRepository.findByUserIdAndCurrencyCodeForUpdate(7L, "USD"))
            .thenReturn(Optional.of(holding));

        boolean settled = cashHoldingsService.settleReservedCash(
            "USD",
            new BigDecimal("1300.000000"),
            new BigDecimal("1550.000000"),
            7L
        );

        assertFalse(settled);
        assertEquals(new BigDecimal("2000.000000"), holding.getBalance());
        assertEquals(new BigDecimal("200.000000"), holding.getBuyingPower());
        verify(cashHoldingsRepository, never()).save(holding);
    }

    private CashHolding holding(String balance, String buyingPower) {
        CashHolding holding = new CashHolding();
        holding.setBalance(new BigDecimal(balance));
        holding.setBuyingPower(new BigDecimal(buyingPower));
        return holding;
    }
}
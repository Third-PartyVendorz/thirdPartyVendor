package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
    private CashHolding cashHolding;

    @BeforeEach
    void setUp() throws Exception {
        cashHoldingsRepository = mock(CashHoldingsRepository.class);
        cashHoldingsService = new CashHoldingsService(
            new ObjectMapper(),
            cashHoldingsRepository,
            mock(CashTransactionRepository.class)
        );

        cashHolding = new CashHolding();
        cashHolding.setUserId(7L);
        cashHolding.setCurrencyCode("USD");
        cashHolding.setBalance(new BigDecimal("100.000000"));
        cashHolding.setBuyingPower(new BigDecimal("100.000000"));
        when(cashHoldingsRepository.findByUserIdAndCurrencyCodeForUpdate(7L, "USD"))
            .thenReturn(Optional.of(cashHolding));
    }

    @Test
    void reserveAndReleaseBuyingPowerDoesNotChangeBalance() {
        cashHoldingsService.reserveBuyingPower("USD", new BigDecimal("40.000000"), 7L);

        assertEquals(0, cashHolding.getBalance().compareTo(new BigDecimal("100.000000")));
        assertEquals(0, cashHolding.getBuyingPower().compareTo(new BigDecimal("60.000000")));

        cashHoldingsService.releaseBuyingPower("USD", new BigDecimal("40.000000"), 7L);

        assertEquals(0, cashHolding.getBuyingPower().compareTo(new BigDecimal("100.000000")));
        verify(cashHoldingsRepository, org.mockito.Mockito.times(2)).save(cashHolding);
    }

    @Test
    void cashBalanceChangesAlsoChangeBuyingPower() {
        cashHoldingsService.updateCashHolding("USD", new BigDecimal("25.000000"), 7L);

        assertEquals(0, cashHolding.getBalance().compareTo(new BigDecimal("125.000000")));
        assertEquals(0, cashHolding.getBuyingPower().compareTo(new BigDecimal("125.000000")));
        verify(cashHoldingsRepository).save(cashHolding);
    }
}
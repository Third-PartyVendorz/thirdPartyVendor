package com.thirdpartyvendor.api.service;

import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.CashHoldingResponse;
import com.thirdpartyvendor.api.entity.CashHolding;
import com.thirdpartyvendor.api.error.CashExceptions.InsufficientCashException;
import com.thirdpartyvendor.api.model.Currency;
import com.thirdpartyvendor.api.repository.CashHoldingsRepository;

import java.math.BigDecimal;
import java.util.List;


@Service
public class CashHoldingsService {
    private final CashHoldingsRepository cashHoldingsRepository;
    
    public CashHoldingsService(CashHoldingsRepository cashHoldingsRepository) {
        this.cashHoldingsRepository = cashHoldingsRepository;
    }

    public void validateSufficientCash(Currency currency, BigDecimal amount, Long userId) {
        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, currency.getCode())
            .orElseThrow(() -> new InsufficientCashException(
                "User holds no cash in " + currency.getCode(),
                currency.getCode(),
                amount,
                BigDecimal.ZERO
            ));

        if (cashHolding.getBalance().compareTo(amount) < 0) {
            throw new InsufficientCashException(
                "Insufficient cash in " + currency.getCode(),
                currency.getCode(),
                amount,
                cashHolding.getBalance()
            );
        }
    }

    public void ensureCashHoldingExists(Currency currency, Long userId) {
        cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, currency.getCode())
            .orElseGet(() -> {
                CashHolding newHolding = new CashHolding();
                newHolding.setUserId(userId);
                newHolding.setCurrencyCode(currency.getCode());
                newHolding.setBalance(BigDecimal.ZERO);
                return cashHoldingsRepository.save(newHolding);
            });
    }

    public void subtractCashHolding(Currency currency, BigDecimal amount, Long userId) {
        validateSufficientCash(currency, amount, userId);
        
        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, currency.getCode())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatusCode.valueOf(404),
                "Cash holding not found in currency: " + currency.getCode()
            ));

        BigDecimal newBalance = cashHolding.getBalance().subtract(amount);

        if (newBalance.compareTo(BigDecimal.ZERO) > 0) {
            cashHolding.setBalance(newBalance);
            cashHoldingsRepository.save(cashHolding);
        } else {
            cashHoldingsRepository.delete(cashHolding);
        }
    }

    public void addCashHolding(Currency currency, BigDecimal amount, Long userId) {
        ensureCashHoldingExists(currency, userId);
        
        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, currency.getCode())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatusCode.valueOf(404),
                "Cash holding not found in currency: " + currency.getCode()
            ));

        BigDecimal newBalance = cashHolding.getBalance().add(amount);
        cashHolding.setBalance(newBalance);
        cashHoldingsRepository.save(cashHolding);
    }

    public List<CashHoldingResponse> getCashHoldingsByUser(Long userId) {
        return cashHoldingsRepository.findByUserId(userId).stream()
            .map(holding -> new CashHoldingResponse(
                holding.getCurrencyCode(),
                holding.getBalance()
            ))
            .toList();
    }

    public CashHoldingResponse deposit(String currencyCode, BigDecimal amount, Long userId) {
        validateCurrencyCode(currencyCode);

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidCurrencyException("Deposit amount must be greater than 0");
        }

        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, currencyCode)
            .orElseGet(() -> {
                CashHolding newHolding = new CashHolding();
                newHolding.setUserId(userId);
                newHolding.setCurrencyCode(currencyCode);
                newHolding.setBalance(BigDecimal.ZERO);
                return newHolding;
            });

        BigDecimal newBalance = cashHolding.getBalance().add(amount);
        cashHolding.setBalance(newBalance);
        cashHoldingsRepository.save(cashHolding);

        return new CashHoldingResponse(
            cashHolding.getCurrencyCode(),
            cashHolding.getBalance()
        );
    }
}
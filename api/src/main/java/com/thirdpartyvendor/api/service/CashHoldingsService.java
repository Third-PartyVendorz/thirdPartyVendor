package com.thirdpartyvendor.api.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdpartyvendor.api.dto.CashHoldingResponse;
import com.thirdpartyvendor.api.dto.CurrencyData;
import com.thirdpartyvendor.api.entity.CashHolding;
import com.thirdpartyvendor.api.repository.CashHoldingsRepository;
import com.thirdpartyvendor.api.service.ForexService.InsufficientCashException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;


@Service
public class CashHoldingsService {
    private final CashHoldingsRepository cashHoldingsRepository;
    private final Map<String, CurrencyData> currencies;
    
    public CashHoldingsService(ObjectMapper mapper, CashHoldingsRepository cashHoldingsRepository) throws IOException {
        ClassPathResource resource = new ClassPathResource("currency.json");
        this.currencies = mapper.readValue(
            resource.getInputStream(),
            new TypeReference<Map<String, CurrencyData>>() {}
        );
        this.cashHoldingsRepository = cashHoldingsRepository;
    }
    
    public void validateCurrencyCode(String currencyCode) {
        if (!currencies.containsKey(currencyCode)) {
            throw new InvalidCurrencyException("Invalid currency code: " + currencyCode);
        }
    }
    
    public void updateCashHolding(String currencyCode, BigDecimal delta, Long userId) {
        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, currencyCode)
            .orElseThrow(() -> new InsufficientCashException("User holds no cash in " + currencyCode));

        BigDecimal newBalance = cashHolding.getBalance().add(delta);

        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new InsufficientCashException("Insufficient cash in " + currencyCode);
        }

        if (newBalance.compareTo(BigDecimal.ZERO) > 0) {
            cashHolding.setBalance(newBalance);
            cashHoldingsRepository.save(cashHolding);
        } else {
            cashHoldingsRepository.delete(cashHolding);
        }
    }

    public void ensureCashHoldingExists(String currencyCode, Long userId) {
        cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, currencyCode)
            .orElseGet(() -> {
                CashHolding newHolding = new CashHolding();
                newHolding.setUserId(userId);
                newHolding.setCurrencyCode(currencyCode);
                newHolding.setBalance(BigDecimal.ZERO);
                return cashHoldingsRepository.save(newHolding);
            });
    }

    public List<CashHoldingResponse> getCashHoldingsByUser(Long userId) {
        return cashHoldingsRepository.findByUserId(userId).stream()
            .map(holding -> new CashHoldingResponse(
                holding.getCurrencyCode(),
                holding.getBalance()
            ))
            .toList();
    }

    public static class InvalidCurrencyException extends RuntimeException {
		public InvalidCurrencyException(String message) {
			super(message);
		}
	}
}

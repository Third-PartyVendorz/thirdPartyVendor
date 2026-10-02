package com.thirdpartyvendor.api.model;

import com.thirdpartyvendor.api.dto.CurrencyData;
import org.springframework.core.io.ClassPathResource;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;

public final class Currency {
    private static final Map<String, CurrencyData> VALID_CURRENCIES;
    
    static {
        try {
            ObjectMapper mapper = new ObjectMapper();
            ClassPathResource resource = new ClassPathResource("currency.json");
            VALID_CURRENCIES = mapper.readValue(
                resource.getInputStream(),
                new TypeReference<Map<String, CurrencyData>>() {}
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to load currency data from currency.json", e);
        }
    }

    private final String code;
    private final CurrencyData data;

    public static Currency of(String rawCode) {
        if (rawCode == null) {
            throw new InvalidCurrencyException("Currency code cannot be null");
        }
        
        String normalized = rawCode.trim().toUpperCase(Locale.ROOT);
        
        CurrencyData data = VALID_CURRENCIES.get(normalized);
        if (data == null) {
            throw new InvalidCurrencyException("Invalid currency code: " + rawCode);
        }
        
        return new Currency(normalized, data);
    }

    private Currency(String code, CurrencyData data) {
        this.code = code;
        this.data = data;
    }

    public String getCode() {
        return code;
    }

    public String getSymbol() {
        return data.symbol();
    }

    public String getName() {
        return data.name();
    }

    public Integer getDecimalDigits() {
        return data.decimalDigits();
    }

    public CurrencyData getData() {
        return data;
    }

    @Override
    public String toString() {
        return code;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Currency)) return false;
        Currency currency = (Currency) o;
        return code.equals(currency.code);
    }

    @Override
    public int hashCode() {
        return code.hashCode();
    }

    public static class InvalidCurrencyException extends RuntimeException {
        public InvalidCurrencyException(String message) {
            super(message);
        }
    }
}

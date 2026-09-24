package com.thirdpartyvendor.api.service;

import java.math.BigDecimal;

import com.thirdpartyvendor.api.client.MarketDataAPIClient;
import com.thirdpartyvendor.api.dto.ForexRequest;
import com.thirdpartyvendor.api.dto.ForexResponse;
import com.thirdpartyvendor.api.dto.MarketQuoteAPIResponse;
import com.thirdpartyvendor.api.entity.ForexLog;
import com.thirdpartyvendor.api.repository.ForexLogRepository;

import jakarta.transaction.Transactional;

public class ForexService {

    private final ForexLogRepository forexLogRepository;
    private final CashHoldingsService cashHoldingsService;
    private final MarketDataAPIClient marketDataAPIClient;

    public ForexService(ForexLogRepository forexLogRepository, CashHoldingsService cashHoldingsService, MarketDataAPIClient marketDataAPIClient) {
        this.forexLogRepository = forexLogRepository;
        this.cashHoldingsService = cashHoldingsService;
        this.marketDataAPIClient = marketDataAPIClient;
    }

    @Transactional 
    public ForexResponse executeExchange(ForexRequest forexRequest, Long userId) {

        String fromCurrency = forexRequest.fromCurrency().trim();
        String toCurrency = forexRequest.toCurrency().trim();

        cashHoldingsService.validateCurrencyCode(fromCurrency);
        cashHoldingsService.validateCurrencyCode(toCurrency);

        BigDecimal amountToConvert = forexRequest.amount();
        
        // validate amount is positive
        if (amountToConvert.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ExchangeAmountExcpetion("Exchange amount must be positive");
        }

        // validate user has sufficient cash in the fromCurrency and deduct it
        cashHoldingsService.updateCashHolding(fromCurrency, amountToConvert.negate(), userId);
            
        // ensure the holding in the to currency exists, create holding entry if not exists
        cashHoldingsService.ensureCashHoldingExists(toCurrency, userId);

        // fetch exchange rate
        MarketQuoteAPIResponse quoteResponse = marketDataAPIClient
            .fetchForexQuote(fromCurrency, toCurrency);

        // convert
        BigDecimal exchangeRate = quoteResponse.data().price();
        BigDecimal convertedAmount = amountToConvert.multiply(exchangeRate);

        // add converted amount to the toCurrency holding
        cashHoldingsService.updateCashHolding(toCurrency, convertedAmount, userId);

        // create log entry for the exchange
        ForexLog forexLog = new ForexLog();
        forexLog.setUserId(userId);
        forexLog.setFromCurrency(fromCurrency);
        forexLog.setToCurrency(toCurrency);
        forexLog.setFromAmount(amountToConvert);
        forexLog.setToAmount(convertedAmount);
        forexLog.setExchangeRate(exchangeRate);

        // save log
        ForexLog savedLog = forexLogRepository.save(forexLog);

        return new ForexResponse(
            savedLog.getExchangeId(),
            savedLog.getUserId(),
            savedLog.getFromCurrency(),
            savedLog.getToCurrency(),
            savedLog.getFromAmount(),
            savedLog.getToAmount(),
            savedLog.getExchangeRate(),
            savedLog.getExchangeTimestamp()
        );
    }

    public static class InsufficientCashException extends RuntimeException {
		public InsufficientCashException(String message) {
			super(message);
		}
	}

    public static class ExchangeAmountExcpetion extends RuntimeException {
        public ExchangeAmountExcpetion(String message) {
			super(message);
		}
    }
}

package com.thirdpartyvendor.api.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.client.MarketDataAPIClient;
import com.thirdpartyvendor.api.dto.ForexRequest;
import com.thirdpartyvendor.api.dto.ForexResponse;
import com.thirdpartyvendor.api.dto.MarketQuoteAPIResponse;
import com.thirdpartyvendor.api.entity.ForexLog;
import com.thirdpartyvendor.api.model.Currency;
import com.thirdpartyvendor.api.repository.ForexLogRepository;

import jakarta.transaction.Transactional;

@Service 
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

        Currency fromCurrency = Currency.of(forexRequest.fromCurrency());
        Currency toCurrency = Currency.of(forexRequest.toCurrency());

        BigDecimal amountToConvert = forexRequest.amount();
        
        if (amountToConvert.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ExchangeAmountException("Exchange amount must be positive");
        }

        MarketQuoteAPIResponse quoteResponse = marketDataAPIClient
            .fetchForexQuote(fromCurrency.getCode(), toCurrency.getCode());

        BigDecimal exchangeRate = quoteResponse.data().price();
        BigDecimal convertedAmount = amountToConvert.multiply(exchangeRate);

        cashHoldingsService.subtractCashHolding(fromCurrency, amountToConvert, userId);
        cashHoldingsService.addCashHolding(toCurrency, convertedAmount, userId);

        ForexLog forexLog = new ForexLog();
        forexLog.setUserId(userId);
        forexLog.setFromCurrency(fromCurrency.getCode());
        forexLog.setToCurrency(toCurrency.getCode());
        forexLog.setFromAmount(amountToConvert);
        forexLog.setToAmount(convertedAmount);
        forexLog.setExchangeRate(exchangeRate);

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

    public List<ForexResponse> findExchangesByUser(Long userId) {
        return forexLogRepository.findByUserId(userId).stream()
            .map(log -> new ForexResponse(
                log.getExchangeId(),
                log.getUserId(),
                log.getFromCurrency(),
                log.getToCurrency(),
                log.getFromAmount(),
                log.getToAmount(),
                log.getExchangeRate(),
                log.getExchangeTimestamp()
            ))
            .toList();
    }

    public static class ExchangeAmountException extends RuntimeException {
        public ExchangeAmountException(String message) {
            super(message);
        }
    }
}

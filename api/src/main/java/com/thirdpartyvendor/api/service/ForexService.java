package com.thirdpartyvendor.api.service;

import java.math.BigDecimal;

import com.thirdpartyvendor.api.client.MarketDataAPIClient;
import com.thirdpartyvendor.api.dto.ForexRequest;
import com.thirdpartyvendor.api.dto.ForexResponse;
import com.thirdpartyvendor.api.dto.MarketQuoteAPIResponse;
import com.thirdpartyvendor.api.entity.CashHolding;
import com.thirdpartyvendor.api.entity.ForexLog;
import com.thirdpartyvendor.api.repository.CashHoldingsRepository;
import com.thirdpartyvendor.api.repository.ForexLogRepository;

import jakarta.transaction.Transactional;

public class ForexService {

    private final ForexLogRepository forexLogRepository;
    private final CashHoldingsRepository cashHoldingsRepository;
    private final MarketDataAPIClient marketDataAPIClient;

    public ForexService(ForexLogRepository forexLogRepository, CashHoldingsRepository cashHoldingsRepository, MarketDataAPIClient marketDataAPIClient) {
        this.forexLogRepository = forexLogRepository;
        this.cashHoldingsRepository = cashHoldingsRepository;
        this.marketDataAPIClient = marketDataAPIClient;
    }

    @Transactional 
    public ForexResponse executeExchange(ForexRequest forexRequest, Long userId) {

        String fromCurrency = forexRequest.fromCurrency();
        String toCurrency = forexRequest.toCurrency();

        // fetch exchange rate
        MarketQuoteAPIResponse quoteResponse = marketDataAPIClient
            .fetchForexQuote(fromCurrency, toCurrency);

        // fetch the holding in the from currency, throw exception if not exists
        CashHolding fromHolding = cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, fromCurrency)
            .orElseThrow(() -> new CashHoldingNotFoundException("User has no cash holding in currency " + fromCurrency));
            
        // fetch the holding in the to currency, create holding entry if not exists
        CashHolding toHolding = cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, toCurrency)
            .orElseGet(() -> {
                CashHolding newHolding = new CashHolding();
                newHolding.setUserId(userId);
                newHolding.setCurrencyCode(toCurrency);
                newHolding.setBalance(BigDecimal.ZERO);
                return cashHoldingsRepository.save(newHolding);
            });

        // convert
        BigDecimal amountToConvert = forexRequest.amount();
        BigDecimal exchangeRate = quoteResponse.data().price();
        BigDecimal convertedAmount = amountToConvert.multiply(exchangeRate);

        // calculate new balances
        BigDecimal newFromBalance = fromHolding.getBalance().subtract(amountToConvert);
        BigDecimal newToBalance = toHolding.getBalance().add(convertedAmount);

        // save new balances
        fromHolding.setBalance(newFromBalance);
        cashHoldingsRepository.save(fromHolding);

        toHolding.setBalance(newToBalance);
        cashHoldingsRepository.save(toHolding);

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

    public static class CashHoldingNotFoundException extends RuntimeException {
		public CashHoldingNotFoundException(String message) {
			super(message);
		}
	}
}

package com.thirdpartyvendor.api.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdpartyvendor.api.dto.CashHoldingResponse;
import com.thirdpartyvendor.api.dto.CashTransactionResponse;
import com.thirdpartyvendor.api.dto.CurrencyData;
import com.thirdpartyvendor.api.entity.CashHolding;
import com.thirdpartyvendor.api.entity.CashTransaction;
import com.thirdpartyvendor.api.error.CashExceptions.InsufficientCashException;
import com.thirdpartyvendor.api.error.CashExceptions.InvalidCurrencyException;
import com.thirdpartyvendor.api.repository.CashHoldingsRepository;
import com.thirdpartyvendor.api.repository.CashTransactionRepository;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;


@Service
public class CashHoldingsService {
    private final CashHoldingsRepository cashHoldingsRepository;
    private final CashTransactionRepository cashTransactionRepository;
    private final Map<String, CurrencyData> currencies;
    
    public CashHoldingsService(
        ObjectMapper mapper,
        CashHoldingsRepository cashHoldingsRepository,
        CashTransactionRepository cashTransactionRepository
    ) throws IOException {
        ClassPathResource resource = new ClassPathResource("currency.json");
        this.currencies = mapper.readValue(
            resource.getInputStream(),
            new TypeReference<Map<String, CurrencyData>>() {}
        );
        this.cashHoldingsRepository = cashHoldingsRepository;
        this.cashTransactionRepository = cashTransactionRepository;
    }
    
    public void validateCurrencyCode(String currencyCode) {
        if (!currencies.containsKey(currencyCode)) {
            throw new InvalidCurrencyException("Invalid currency code: " + currencyCode);
        }
    }
    
    @Transactional
    public void updateCashHolding(String currencyCode, BigDecimal delta, Long userId) {
        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCodeForUpdate(userId, currencyCode)
            .orElseThrow(() -> new InsufficientCashException("User holds no cash in " + currencyCode));

        BigDecimal newBalance = cashHolding.getBalance().add(delta);
        BigDecimal newBuyingPower = cashHolding.getBuyingPower().add(delta);

        if (newBalance.compareTo(BigDecimal.ZERO) < 0 || newBuyingPower.compareTo(BigDecimal.ZERO) < 0) {
            throw new InsufficientCashException("Insufficient buying power in " + currencyCode);
        }

        if (newBalance.compareTo(BigDecimal.ZERO) > 0) {
            cashHolding.setBalance(newBalance);
            cashHolding.setBuyingPower(newBuyingPower);
            cashHoldingsRepository.save(cashHolding);
        } else {
            cashHoldingsRepository.delete(cashHolding);
        }
    }

    public void ensureSufficientCash(String currencyCode, BigDecimal amount, Long userId) {
        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, currencyCode)
            .orElseThrow(() -> new InsufficientCashException("User holds no cash in " + currencyCode));

        if (cashHolding.getBuyingPower().compareTo(amount) < 0) {
            throw new InsufficientCashException("Insufficient buying power in " + currencyCode);
        }
    }

    @Transactional
    public void reserveCash(String currencyCode, BigDecimal amount, Long userId) {
        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCodeForUpdate(userId, currencyCode)
            .orElseThrow(() -> new InsufficientCashException("User holds no cash in " + currencyCode));

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0
            || cashHolding.getBuyingPower().compareTo(amount) < 0) {
            throw new InsufficientCashException("Insufficient buying power in " + currencyCode);
        }

        cashHolding.setBuyingPower(cashHolding.getBuyingPower().subtract(amount));
        cashHoldingsRepository.save(cashHolding);
    }

    @Transactional
    public void releaseReservedCash(String currencyCode, BigDecimal amount, Long userId) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCodeForUpdate(userId, currencyCode)
            .orElseThrow(() -> new InsufficientCashException("User holds no cash in " + currencyCode));
        cashHolding.setBuyingPower(cashHolding.getBuyingPower().add(amount));
        cashHoldingsRepository.save(cashHolding);
    }

    @Transactional
    public boolean settleReservedCash(
        String currencyCode,
        BigDecimal reservedAmount,
        BigDecimal actualAmount,
        Long userId
    ) {
        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCodeForUpdate(userId, currencyCode)
            .orElseThrow(() -> new InsufficientCashException("User holds no cash in " + currencyCode));

        BigDecimal reservation = reservedAmount == null ? BigDecimal.ZERO : reservedAmount;
        BigDecimal adjustment = actualAmount.subtract(reservation);
        BigDecimal newBalance = cashHolding.getBalance().subtract(actualAmount);
        BigDecimal newBuyingPower = cashHolding.getBuyingPower().subtract(adjustment);

        if (newBalance.compareTo(BigDecimal.ZERO) < 0 || newBuyingPower.compareTo(BigDecimal.ZERO) < 0) {
            return false;
        }

        cashHolding.setBalance(newBalance);
        cashHolding.setBuyingPower(newBuyingPower);
        cashHoldingsRepository.save(cashHolding);
        return true;
    }

    public void ensureCashHoldingExists(String currencyCode, Long userId) {
        cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, currencyCode)
            .orElseGet(() -> {
                CashHolding newHolding = new CashHolding();
                newHolding.setUserId(userId);
                newHolding.setCurrencyCode(currencyCode);
                newHolding.setBalance(BigDecimal.ZERO);
                newHolding.setBuyingPower(BigDecimal.ZERO);
                return cashHoldingsRepository.save(newHolding);
            });
    }

    public CashHoldingResponse getCashHoldingByUserAndCurrencyCode(Long userId, String currencyCode) {
        return cashHoldingsRepository.findByUserIdAndCurrencyCode(userId, currencyCode)
                .map(holding -> new CashHoldingResponse(
                    holding.getCurrencyCode(),
                    holding.getBalance(),
                    holding.getBuyingPower()
                ))
                .orElseGet(() -> new CashHoldingResponse(currencyCode, BigDecimal.ZERO, BigDecimal.ZERO));
    }

    public List<CashHoldingResponse> getCashHoldingsByUser(Long userId) {
        return cashHoldingsRepository.findByUserId(userId).stream()
            .map(holding -> new CashHoldingResponse(
                holding.getCurrencyCode(),
                holding.getBalance(),
                holding.getBuyingPower()
            ))
            .toList();
    }

    public List<CashTransactionResponse> getRecentTransactions(Long userId) {
        return cashTransactionRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(transaction -> new CashTransactionResponse(
                transaction.getId(),
                transaction.getCurrencyCode(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getCreatedAt()
            ))
            .toList();
    }

    @Transactional
    public CashHoldingResponse deposit(String currencyCode, BigDecimal amount, Long userId) {
        validateCurrencyCode(currencyCode);

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidCurrencyException("Deposit amount must be greater than 0");
        }

        CashHolding cashHolding = cashHoldingsRepository.findByUserIdAndCurrencyCodeForUpdate(userId, currencyCode)
            .orElseGet(() -> {
                CashHolding newHolding = new CashHolding();
                newHolding.setUserId(userId);
                newHolding.setCurrencyCode(currencyCode);
                newHolding.setBalance(BigDecimal.ZERO);
                newHolding.setBuyingPower(BigDecimal.ZERO);
                return newHolding;
            });

        BigDecimal newBalance = cashHolding.getBalance().add(amount);
        BigDecimal newBuyingPower = cashHolding.getBuyingPower().add(amount);
        cashHolding.setBalance(newBalance);
        cashHolding.setBuyingPower(newBuyingPower);
        cashHoldingsRepository.save(cashHolding);

        return new CashHoldingResponse(
            cashHolding.getCurrencyCode(),
            cashHolding.getBalance(),
            cashHolding.getBuyingPower()
        );
    }

    @Transactional
    public CashHoldingResponse transact(String currencyCode, String type, BigDecimal amount, Long userId) {
        validateCurrencyCode(currencyCode);

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidCurrencyException("Transaction amount must be greater than 0");
        }

        if ("DEPOSIT".equals(type)) {
            CashHoldingResponse response = deposit(currencyCode, amount, userId);
            saveTransaction(currencyCode, CashTransaction.TransactionType.DEPOSIT, amount, userId);
            return response;
        }

        if ("WITHDRAW".equals(type)) {
            updateCashHolding(currencyCode, amount.negate(), userId);
            CashHoldingResponse response = getCashHoldingByUserAndCurrencyCode(userId, currencyCode);
            saveTransaction(currencyCode, CashTransaction.TransactionType.WITHDRAW, amount, userId);
            return response;
        }

        throw new InvalidCurrencyException("Invalid cash transaction type: " + type);
    }

    private void saveTransaction(
        String currencyCode,
        CashTransaction.TransactionType type,
        BigDecimal amount,
        Long userId
    ) {
        CashTransaction transaction = new CashTransaction();
        transaction.setUserId(userId);
        transaction.setCurrencyCode(currencyCode);
        transaction.setType(type);
        transaction.setAmount(amount);
        cashTransactionRepository.save(transaction);
    }
}
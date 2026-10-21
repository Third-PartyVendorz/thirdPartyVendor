package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.thirdpartyvendor.api.entity.CashTransaction.TransactionType;

public record CashTransactionResponse(
    Long transactionId,
    String currencyCode,
    TransactionType type,
    BigDecimal amount,
    LocalDateTime createdAt
) {}

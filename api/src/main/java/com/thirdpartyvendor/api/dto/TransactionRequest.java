package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;

public record TransactionRequest(
    String currencyCode,
    BigDecimal amount,
    String type
) {}
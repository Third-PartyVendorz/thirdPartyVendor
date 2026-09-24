package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ForexResponse(
    Long exchangeId,
    Long userId,
    String fromCurrency,
    String toCurrency,
    BigDecimal fromAmount,
    BigDecimal toAmount,
    BigDecimal exchangeRate,
    LocalDateTime exchangeTimestamp
) {}
package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;

public record CashHoldingResponse(
    String currencyCode,
    BigDecimal balance
) {}

package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;

public record ForexRequest(
    String fromCurrency,
    String toCurrency,
    BigDecimal amount
) {
}

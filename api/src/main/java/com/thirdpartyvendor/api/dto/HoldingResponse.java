package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;

public record HoldingResponse (
    Long userId,
    String security,
    String ticker,
    String assetType,
    BigDecimal numShares
) {}
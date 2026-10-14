package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TradeResponse(
    Long tradeId,
    Long orderId,
    String ticker,
    BigDecimal executionPrice,
    BigDecimal executionQuantity,
    LocalDateTime tradeTimestamp,
    String tradeCurrency
){}

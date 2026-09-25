package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;

public record MarketQuoteAPIResponse(
    Data data,
    Meta meta
) {
    public record Data(
        String symbol,
        BigDecimal price,
        BigDecimal bid,
        BigDecimal ask,
        BigDecimal spreadBps,
        String currency,
        BigDecimal change,
        BigDecimal changePercent,
        BigDecimal previousClose,
        String asOf,
        String marketState
    ) {}

    public record Meta(
        String asOf,
        String disclaimer,
        String symbol,
        String source,
        Boolean stale,
        Boolean partial,
        String availableFrom,
        String spreadSource
    ) {}
}
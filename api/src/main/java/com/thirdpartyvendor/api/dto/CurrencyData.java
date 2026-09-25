package com.thirdpartyvendor.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CurrencyData(
    String symbol,
    String name,
    @JsonProperty("symbol_native")
    String symbolNative,
    @JsonProperty("decimal_digits")
    Integer decimalDigits,
    Double rounding,
    String code,
    @JsonProperty("name_plural")
    String namePlural
) {} 

package com.thirdpartyvendor.api.dto;

import java.util.List;

public record RemoveWatchlistRequest(List<String> tickers) {
}
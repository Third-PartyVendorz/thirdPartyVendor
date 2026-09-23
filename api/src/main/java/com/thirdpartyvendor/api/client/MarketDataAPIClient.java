package com.thirdpartyvendor.api.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.thirdpartyvendor.api.dto.MarketQuoteAPIResponse;

@Component
public class MarketDataAPIClient {

    private final String BASE_URL = "https://api.example.com";

    private final RestClient restClient;
    
    public MarketDataAPIClient(RestClient.Builder builder) {
        this.restClient = builder.baseUrl(BASE_URL).build();
    }
    
    public MarketQuoteAPIResponse fetchQuote(String symbol) {
        return restClient.get()
            .uri("/quotes/{symbol}", symbol)
            .retrieve()
            .body(MarketQuoteAPIResponse.class);
    }

    public MarketQuoteAPIResponse fetchForexQuote(String fromCurrency, String toCurrency) {
        return fetchQuote("FX:" + fromCurrency + toCurrency);
    }
}

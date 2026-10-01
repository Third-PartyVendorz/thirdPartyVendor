package com.thirdpartyvendor.api.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.thirdpartyvendor.api.dto.MarketQuoteAPIResponse;

@Component
public class MarketDataAPIClient {

    private final RestClient restClient;
    
    public MarketDataAPIClient(RestClient.Builder builder, 
            @Value("${FAUXNANCE_API_URL}") String apiUrl,
            @Value("${FAUXNANCE_API_KEY}") String apiKey) {
        
        this.restClient = builder
                .baseUrl(apiUrl)
                .defaultHeader("X-Api-Key", apiKey)
                .build();
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

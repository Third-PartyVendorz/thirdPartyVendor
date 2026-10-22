package com.thirdpartyvendor.api.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.TrendingTickerResponse;
import com.thirdpartyvendor.api.service.TrendingService;

@RestController
@RequestMapping("/trending")
public class TrendingController {

    private final TrendingService trendingService;

    public TrendingController(TrendingService trendingService) {
        this.trendingService = trendingService;
    }

    @GetMapping("/tickers")
    public List<TrendingTickerResponse> getTrendingTickers(
        @RequestParam("from") Instant from,
        @RequestParam("to") Instant to,
        @RequestParam(value = "k", defaultValue = "5") int k
    ) {
        return trendingService.getTrendingTickers(from, to, k);
    }
}

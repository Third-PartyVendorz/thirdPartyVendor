package com.thirdpartyvendor.api.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import com.thirdpartyvendor.api.repository.HoldingsRepository;
import com.thirdpartyvendor.api.dto.HoldingResponse;

@Service
public class HoldingsService {
    private final HoldingsRepository holdingsRepository;

    public HoldingsService(HoldingsRepository holdingsRepository) {
        this.holdingsRepository = holdingsRepository;
    }

    public List<HoldingResponse> getHoldings(Long userId) {
        return holdingsRepository.findByUserId(userId).stream()
            .map(holding -> new HoldingResponse(
                holding.getUserId(),
                holding.getSecurity(),
                holding.getTicker(),
                holding.getAssetType(),
                holding.getNumShares()
            ))
            .collect(Collectors.toList());
    }

    public HoldingResponse getHoldingByTicker(Long userId, String ticker) {
    return holdingsRepository.findByUserIdAndTicker(userId, ticker)
        .map(holding -> new HoldingResponse(
            holding.getUserId(),
            holding.getSecurity(),
            holding.getTicker(),
            holding.getAssetType(),
            holding.getNumShares()
        ))
        .orElseGet(() -> new HoldingResponse(
            userId,
            null,
            ticker,
            null,
            BigDecimal.ZERO
        ));
    }

}
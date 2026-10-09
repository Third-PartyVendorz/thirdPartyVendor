package com.thirdpartyvendor.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;
import com.thirdpartyvendor.api.service.HoldingsService;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.dto.HoldingResponse;

@RestController
@RequestMapping("/holdings")
public class HoldingsController {
    private final HoldingsService holdingsService;

    public HoldingsController(HoldingsService holdingsService) {
        this.holdingsService = holdingsService;
    }

    @GetMapping
    public List<HoldingResponse> getHoldings(@AuthenticationPrincipal AppUser currentUser) {
        return holdingsService.getHoldings(currentUser.getId());
    }
}
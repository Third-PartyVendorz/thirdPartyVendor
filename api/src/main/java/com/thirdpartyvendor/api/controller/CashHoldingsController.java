package com.thirdpartyvendor.api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.CashHoldingResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.CashHoldingsService;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;


@RestController 
@RequestMapping("/cashHoldings")
public class CashHoldingsController {
    
    private final CashHoldingsService cashHoldingsService;

    public CashHoldingsController(CashHoldingsService cashHoldingsService) {
        this.cashHoldingsService = cashHoldingsService;
    }

    @GetMapping
    public List<CashHoldingResponse> getCashHoldingsByUser(@AuthenticationPrincipal AppUser currentUser) {
        return cashHoldingsService.getCashHoldingsByUser(currentUser.getId());
    }
}

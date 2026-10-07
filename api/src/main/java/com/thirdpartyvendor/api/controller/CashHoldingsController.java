package com.thirdpartyvendor.api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.CashHoldingResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.CashHoldingsService;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController 
@RequestMapping("/cashHoldings")
public class CashHoldingsController {
    
    private final CashHoldingsService cashHoldingsService;

    public CashHoldingsController(CashHoldingsService cashHoldingsService) {
        this.cashHoldingsService = cashHoldingsService;
    }

    @GetMapping("/{currencyCode}")
    public CashHoldingResponse getCashHoldingsByUserAndCurrencyCode(@AuthenticationPrincipal AppUser currentUser, @PathVariable String currencyCode) {
        return cashHoldingsService.getCashHoldingByUserAndCurrencyCode(currentUser.getId(), currencyCode);
    }
    

    @GetMapping
    public List<CashHoldingResponse> getCashHoldingsByUser(@AuthenticationPrincipal AppUser currentUser) {
        return cashHoldingsService.getCashHoldingsByUser(currentUser.getId());
    }
}

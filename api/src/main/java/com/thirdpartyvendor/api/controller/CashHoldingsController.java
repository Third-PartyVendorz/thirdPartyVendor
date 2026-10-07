package com.thirdpartyvendor.api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.CashHoldingResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.CashHoldingsService;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.thirdpartyvendor.api.dto.DepositRequest;
import org.springframework.http.ResponseEntity;

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

    @PostMapping 
    public ResponseEntity<CashHoldingResponse> deposit(
        @RequestBody DepositRequest depositRequest,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return ResponseEntity.ok(cashHoldingsService.deposit(
            depositRequest.currencyCode(),
            depositRequest.amount(),
            currentUser.getId()
        ));
    }
}

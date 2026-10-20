package com.thirdpartyvendor.api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.CashHoldingResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.CashHoldingsService;
import com.thirdpartyvendor.api.util.AuthorizationUtil;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.thirdpartyvendor.api.dto.TransactionRequest;
import org.springframework.http.ResponseEntity;

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

    @PostMapping 
    public ResponseEntity<CashHoldingResponse> transact(
        @RequestBody TransactionRequest transactionRequest,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        AuthorizationUtil.requireNotFrozen(currentUser);
        return ResponseEntity.ok(cashHoldingsService.transact(
            transactionRequest.currencyCode(),
            transactionRequest.type(),
            transactionRequest.amount(),
            currentUser.getId()
        ));
    }
}

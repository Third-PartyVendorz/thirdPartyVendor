package com.thirdpartyvendor.api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.TradeResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.TradeService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController 
@RequestMapping("/trades")
public class TradeController {
    private final TradeService tradeService;

    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @GetMapping 
    public List<TradeResponse> getTradesByUser(@AuthenticationPrincipal AppUser currentUser) {
        return tradeService.getTradesByUser(currentUser.getId());
    }

    @GetMapping("/{tradeId}") 
    public TradeResponse getTradeById(@PathVariable Long tradeId) {
        return tradeService.getTradeById(tradeId);
    }
}

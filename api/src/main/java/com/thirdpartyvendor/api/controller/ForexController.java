package com.thirdpartyvendor.api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.ForexRequest;
import com.thirdpartyvendor.api.dto.ForexResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.ForexService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



/**
 * This class only handles routes associated with forex transactions.
 * Retrieving latest exchange rates is located elsewhere.
 */
@RestController 
@RequestMapping("/forex")
public class ForexController {
    
    private final ForexService forexService;

    public ForexController(ForexService forexService) {
        this.forexService = forexService;
    }

    @PostMapping
    public ResponseEntity<ForexResponse> submitExchange(@RequestBody ForexRequest forexRequest, @AuthenticationPrincipal AppUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(forexService.executeExchange(forexRequest, currentUser.getId()));
    }

    @GetMapping
    public List<ForexResponse> getExchangesByUser(@AuthenticationPrincipal AppUser currentUser) {
        return forexService.findExchangesByUser(currentUser.getId());
    }
    
}

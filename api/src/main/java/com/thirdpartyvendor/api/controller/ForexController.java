package com.thirdpartyvendor.api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.ForexRequest;
import com.thirdpartyvendor.api.dto.ForexResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.ForexService;

import org.springframework.security.core.context.SecurityContextHolder;
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

    private AppUser getCurrentUser() {
		return (AppUser) SecurityContextHolder.getContext()
			.getAuthentication().getPrincipal();
	}

    @PostMapping
    public ForexResponse submitExchange(@RequestBody ForexRequest forexRequest) {
        AppUser user = getCurrentUser();
        return forexService.executeExchange(forexRequest, user.getId());
    }
    
}

package com.thirdpartyvendor.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.AddWatchlistRequest;
import com.thirdpartyvendor.api.dto.RemoveWatchlistRequest;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.WatchlistService;

@RestController
@RequestMapping("/watchlist")
public class WatchlistController {

	private final WatchlistService watchlistService;

	public WatchlistController(WatchlistService watchlistService) {
		this.watchlistService = watchlistService;
	}

	@GetMapping
	public List<String> getWatchlist(@AuthenticationPrincipal AppUser currentUser) {
		return watchlistService.getWatchlist(currentUser.getId());
	}

	@PostMapping
	public ResponseEntity<List<String>> addToWatchlist(
		@RequestBody AddWatchlistRequest request,
		@AuthenticationPrincipal AppUser currentUser
	) {
		return ResponseEntity.ok(watchlistService.addToWatchlist(currentUser.getId(), request.ticker()));
	}

	@DeleteMapping
	public ResponseEntity<List<String>> removeFromWatchlist(
		@RequestBody RemoveWatchlistRequest request,
		@AuthenticationPrincipal AppUser currentUser
	) {
		return ResponseEntity.ok(watchlistService.removeFromWatchlist(currentUser.getId(), request.tickers()));
	}
}
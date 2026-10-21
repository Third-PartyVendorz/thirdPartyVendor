package com.thirdpartyvendor.api.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.dto.AddWatchlistRequest;
import com.thirdpartyvendor.api.dto.RemoveWatchlistRequest;
import com.thirdpartyvendor.api.service.WatchlistService;

class WatchlistControllerTest {

	private final WatchlistService watchlistService = mock(WatchlistService.class);
	private final WatchlistController watchlistController = new WatchlistController(watchlistService);

	@Test
	void getsWatchlistForAuthenticatedUser() {
		AppUser user = new AppUser();
		user.setId(7L);
		when(watchlistService.getWatchlist(7L)).thenReturn(List.of("AAPL", "TSLA"));

		assertEquals(List.of("AAPL", "TSLA"), watchlistController.getWatchlist(user));
		verify(watchlistService).getWatchlist(7L);
	}

	@Test
	void addsTickerForAuthenticatedUser() {
		AppUser user = user(7L);
		when(watchlistService.addToWatchlist(7L, "AAPL")).thenReturn(List.of("AAPL"));

		assertEquals(List.of("AAPL"), watchlistController.addToWatchlist(new AddWatchlistRequest("AAPL"), user).getBody());
		verify(watchlistService).addToWatchlist(7L, "AAPL");
	}

	@Test
	void removesMultipleTickersForAuthenticatedUser() {
		AppUser user = user(7L);
		List<String> tickers = List.of("AAPL", "TSLA");
		when(watchlistService.removeFromWatchlist(7L, tickers)).thenReturn(List.of());

		assertEquals(List.of(), watchlistController.removeFromWatchlist(new RemoveWatchlistRequest(tickers), user).getBody());
		verify(watchlistService).removeFromWatchlist(7L, tickers);
	}

	private AppUser user(Long id) {
		AppUser user = new AppUser();
		user.setId(id);
		return user;
	}
}
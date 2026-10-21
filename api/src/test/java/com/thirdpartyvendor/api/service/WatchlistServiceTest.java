package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.thirdpartyvendor.api.entity.Watchlist;
import com.thirdpartyvendor.api.repository.WatchlistRepository;

class WatchlistServiceTest {

	private WatchlistRepository watchlistRepository;
	private WatchlistService watchlistService;

	@BeforeEach
	void setUp() {
		watchlistRepository = mock(WatchlistRepository.class);
		watchlistService = new WatchlistService(watchlistRepository);
	}

	@Test
	void returnsTickersForUser() {
		Long userId = 1L;
		when(watchlistRepository.findTop25ByUserIdOrderByTickerAsc(userId)).thenReturn(List.of(
			watchlistEntry(userId, "AAPL"),
			watchlistEntry(userId, "TSLA")
		));

		assertEquals(List.of("AAPL", "TSLA"), watchlistService.getWatchlist(userId));
		verify(watchlistRepository).findTop25ByUserIdOrderByTickerAsc(userId);
	}

	@Test
	void returnsEmptyListWhenUserHasNoEntries() {
		Long userId = 1L;
		when(watchlistRepository.findTop25ByUserIdOrderByTickerAsc(userId)).thenReturn(List.of());

		assertEquals(List.of(), watchlistService.getWatchlist(userId));
		verify(watchlistRepository).findTop25ByUserIdOrderByTickerAsc(userId);
	}

	@Test
	void addsNormalizedTickerAndReturnsUpdatedWatchlist() {
		Long userId = 1L;
		when(watchlistRepository.findTop25ByUserIdOrderByTickerAsc(userId)).thenReturn(List.of(
			watchlistEntry(userId, "AAPL")
		));

		assertEquals(List.of("AAPL"), watchlistService.addToWatchlist(userId, " aapl "));
		verify(watchlistRepository).save(any(Watchlist.class));
		verify(watchlistRepository).findTop25ByUserIdOrderByTickerAsc(userId);
	}

	@Test
	void removesMultipleNormalizedTickersAndReturnsUpdatedWatchlist() {
		Long userId = 1L;
		when(watchlistRepository.findTop25ByUserIdOrderByTickerAsc(userId)).thenReturn(List.of());

		assertEquals(List.of(), watchlistService.removeFromWatchlist(userId, List.of(" aapl ", "tsla")));
		verify(watchlistRepository).deleteByUserIdAndTickerIn(userId, List.of("AAPL", "TSLA"));
		verify(watchlistRepository).findTop25ByUserIdOrderByTickerAsc(userId);
	}

	@Test
	void rejectsAddingWhenUserAlreadyHas25Entries() {
		Long userId = 1L;
		when(watchlistRepository.countByUserId(userId)).thenReturn(25L);

		assertThrows(
			com.thirdpartyvendor.api.error.WatchlistExceptions.WatchlistLimitException.class,
			() -> watchlistService.addToWatchlist(userId, "AAPL")
		);
		verify(watchlistRepository).countByUserId(userId);
	}

	private Watchlist watchlistEntry(Long userId, String ticker) {
		Watchlist entry = new Watchlist();
		entry.setUserId(userId);
		entry.setTicker(ticker);
		return entry;
	}
}
package com.thirdpartyvendor.api.service;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.entity.Watchlist;
import com.thirdpartyvendor.api.error.WatchlistExceptions.WatchlistLimitException;
import com.thirdpartyvendor.api.repository.WatchlistRepository;

@Service
public class WatchlistService {

	private final WatchlistRepository watchlistRepository;

	public WatchlistService(WatchlistRepository watchlistRepository) {
		this.watchlistRepository = watchlistRepository;
	}

	public List<String> getWatchlist(Long userId) {
		return watchlistRepository.findTop25ByUserIdOrderByTickerAsc(userId).stream()
			.map(watchlistEntry -> watchlistEntry.getTicker())
			.toList();
	}

	public List<String> addToWatchlist(Long userId, String ticker) {
		if (watchlistRepository.countByUserId(userId) >= 25) {
			throw new WatchlistLimitException();
		}

		Watchlist watchlistEntry = new Watchlist();
		watchlistEntry.setUserId(userId);
		watchlistEntry.setTicker(normalizeTicker(ticker));
		watchlistRepository.save(watchlistEntry);
		return getWatchlist(userId);
	}

	public List<String> removeFromWatchlist(Long userId, List<String> tickers) {
		List<String> normalizedTickers = tickers.stream()
			.map(this::normalizeTicker)
			.toList();
		watchlistRepository.deleteByUserIdAndTickerIn(userId, normalizedTickers);
		return getWatchlist(userId);
	}

	private String normalizeTicker(String ticker) {
		return ticker.trim().toUpperCase(Locale.ROOT);
	}
}
package com.thirdpartyvendor.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thirdpartyvendor.api.entity.Watchlist;
import com.thirdpartyvendor.api.entity.WatchlistId;

public interface WatchlistRepository extends JpaRepository<Watchlist, WatchlistId> {

	List<Watchlist> findTop25ByUserIdOrderByTickerAsc(Long userId);

	void deleteByUserIdAndTickerIn(Long userId, List<String> tickers);
}
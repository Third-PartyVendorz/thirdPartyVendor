package com.thirdpartyvendor.api.entity;

import java.io.Serializable;
import java.util.Objects;

public class WatchlistId implements Serializable {

	private Long userId;
	private String ticker;

	public WatchlistId() {
	}

	public WatchlistId(Long userId, String ticker) {
		this.userId = userId;
		this.ticker = ticker;
	}

	@Override
	public boolean equals(Object object) {
		if (this == object) {
			return true;
		}
		if (!(object instanceof WatchlistId other)) {
			return false;
		}
		return Objects.equals(userId, other.userId) && Objects.equals(ticker, other.ticker);
	}

	@Override
	public int hashCode() {
		return Objects.hash(userId, ticker);
	}
}
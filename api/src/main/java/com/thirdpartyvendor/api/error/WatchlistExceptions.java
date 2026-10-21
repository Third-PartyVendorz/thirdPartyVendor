package com.thirdpartyvendor.api.error;

public final class WatchlistExceptions {

	private WatchlistExceptions() {
	}

	public static class WatchlistLimitException extends RuntimeException {

		public WatchlistLimitException() {
			super("Watchlist limited at 25 entries");
		}
	}
}
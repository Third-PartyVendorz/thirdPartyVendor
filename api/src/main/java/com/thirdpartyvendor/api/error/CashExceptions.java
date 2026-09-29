package com.thirdpartyvendor.api.error;

public final class CashExceptions {

	private CashExceptions() {
	}

	public static class InvalidCurrencyException extends RuntimeException {
		public InvalidCurrencyException(String message) {
			super(message);
		}
	}

	public static class InsufficientCashException extends RuntimeException {
		public InsufficientCashException(String message) {
			super(message);
		}
	}
}
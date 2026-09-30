package com.thirdpartyvendor.api.error;

public final class ForexExceptions {

	private ForexExceptions() {
	}

	public static class ExchangeAmountExcpetion extends RuntimeException {
		public ExchangeAmountExcpetion(String message) {
			super(message);
	}
	}
}
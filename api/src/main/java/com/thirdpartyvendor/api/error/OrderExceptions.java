package com.thirdpartyvendor.api.error;
import java.math.BigDecimal;

public final class OrderExceptions {

	private OrderExceptions() {
	}

	public static class OrderNotFoundException extends RuntimeException {
		public OrderNotFoundException(String message) {
			super(message);
		}
	}

	public static class BadOrderException extends RuntimeException {
		public BadOrderException(String message) {
			super(message);
		}
	}

	public static class InsufficientSharesException extends RuntimeException {
		private String ticker;
		private BigDecimal requestedQuantity;
		private BigDecimal availableShares;

		public InsufficientSharesException(String message, String ticker, BigDecimal requestedQuantity, BigDecimal availableShares) {
			super(message);
			this.ticker = ticker;
			this.requestedQuantity = requestedQuantity;
			this.availableShares = availableShares;
		}

		public String getTicker() {
			return ticker;
		}

		public BigDecimal getRequestedQuantity() {
			return requestedQuantity;
		}

		public BigDecimal getAvailableShares() {
			return availableShares;
		}
	}
}
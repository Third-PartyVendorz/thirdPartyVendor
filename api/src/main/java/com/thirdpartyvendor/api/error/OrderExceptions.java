package com.thirdpartyvendor.api.error;

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
}
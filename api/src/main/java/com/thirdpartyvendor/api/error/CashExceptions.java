package com.thirdpartyvendor.api.error;

import java.math.BigDecimal;

public final class CashExceptions {

	private CashExceptions() {
	}

	public static class InvalidCurrencyException extends RuntimeException {
		public InvalidCurrencyException(String message) {
			super(message);
		}
	}

	// public static class InsufficientCashException extends RuntimeException {
	// 	public InsufficientCashException(String message) {
	// 		super(message);
	// 	}
	// }

	public static class InsufficientCashException extends RuntimeException {
        String currencyCode;
        BigDecimal requestedAmount;
        BigDecimal balance;
        
        public InsufficientCashException(String message, String currencyCode, BigDecimal requestedAmount, BigDecimal balance) {
            super(message);
            this.currencyCode = currencyCode;
            this.requestedAmount = requestedAmount;
            this.balance = balance;
        }
    }
}
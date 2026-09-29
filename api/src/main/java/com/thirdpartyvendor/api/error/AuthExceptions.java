package com.thirdpartyvendor.api.error;

public final class AuthExceptions {

	private AuthExceptions() {
	}

	public static class ForbiddenException extends RuntimeException {
		public ForbiddenException(String message) {
			super(message);
		}
	}
}
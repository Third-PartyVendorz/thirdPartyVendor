package com.thirdpartyvendor.api.error;

public final class UserExceptions {

	private UserExceptions() {
	}

	public static class UserNotFoundException extends RuntimeException {
		public UserNotFoundException(String message) {
			super(message);
		}
	}

	public static class EmailAlreadyInUseException extends RuntimeException {
		public EmailAlreadyInUseException(String message) {
			super(message);
		}
	}

	public static class PasswordException extends RuntimeException {
		public PasswordException(String message) {
			super(message);
		}
	}
}
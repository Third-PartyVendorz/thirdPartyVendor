package com.thirdpartyvendor.api.error;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

public final class AuditExceptions {
    private AuditExceptions() {
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class InvalidAuditIdException extends RuntimeException {
        public InvalidAuditIdException(String message) {
            super(message);
        }
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class AuditEventNotFoundException extends RuntimeException {
        public AuditEventNotFoundException(String message) {
            super(message);
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class UnsupportedAuditEventException extends RuntimeException {
        public UnsupportedAuditEventException(String message) {
            super(message);
        }
    }
}
package com.thirdpartyvendor.api.error;

import java.time.Instant;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.error.AuthExceptions.ForbiddenException;
import com.thirdpartyvendor.api.error.CashExceptions.InsufficientCashException;
import com.thirdpartyvendor.api.error.CashExceptions.InvalidCurrencyException;
import com.thirdpartyvendor.api.error.ForexExceptions.ExchangeAmountExcpetion;
import com.thirdpartyvendor.api.error.OrderExceptions.BadOrderException;
import com.thirdpartyvendor.api.error.OrderExceptions.OrderNotFoundException;
import com.thirdpartyvendor.api.error.UserExceptions.EmailAlreadyInUseException;
import com.thirdpartyvendor.api.error.UserExceptions.PasswordException;
import com.thirdpartyvendor.api.error.UserExceptions.UserNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
		ResponseStatusException exception,
		HttpServletRequest request
	) {
		return buildResponse(exception.getStatusCode(), exception.getReason(), request.getRequestURI());
	}

	@ExceptionHandler({
		ForbiddenException.class,
		org.springframework.security.access.AccessDeniedException.class
	})
	public ResponseEntity<ApiErrorResponse> handleForbiddenException(
		Exception exception,
		HttpServletRequest request
	) {
		return buildResponse(HttpStatus.FORBIDDEN, exception.getMessage(), request.getRequestURI());
	}

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleNotFoundException(
		RuntimeException exception,
		HttpServletRequest request
	) {
		return buildResponse(HttpStatus.NOT_FOUND, exception.getMessage(), request.getRequestURI());
	}

	@ExceptionHandler(OrderNotFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleOrderNotFoundException(
		OrderNotFoundException exception,
		HttpServletRequest request
	) {
		return buildResponse(HttpStatus.NOT_FOUND, exception.getMessage(), request.getRequestURI());
	}

	@ExceptionHandler({
		EmailAlreadyInUseException.class,
		PasswordException.class,
		InvalidCurrencyException.class,
		ExchangeAmountExcpetion.class,
		BadOrderException.class
	})
	public ResponseEntity<ApiErrorResponse> handleBadRequestException(
		RuntimeException exception,
		HttpServletRequest request
	) {
		return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request.getRequestURI());
	}

	@ExceptionHandler(InsufficientCashException.class)
	public ResponseEntity<ApiErrorResponse> handleConflictException(
		InsufficientCashException exception,
		HttpServletRequest request
	) {
		return buildResponse(HttpStatus.CONFLICT, exception.getMessage(), request.getRequestURI());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiErrorResponse> handleValidationException(
		MethodArgumentNotValidException exception,
		HttpServletRequest request
	) {
		String message = exception.getBindingResult().getFieldErrors().stream()
			.findFirst()
			.map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
			.orElse("Request validation failed");

		return buildResponse(HttpStatus.BAD_REQUEST, message, request.getRequestURI());
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
		Exception exception,
		HttpServletRequest request
	) {
		return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request.getRequestURI());
	}

	private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatusCode statusCode, String message, String path) {
		String error = resolveError(statusCode);
		String responseMessage = message == null || message.isBlank() ? error : message;

		return ResponseEntity.status(statusCode.value()).body(new ApiErrorResponse(
			Instant.now(),
			statusCode.value(),
			error,
			responseMessage,
			path
		));
	}

	private String resolveError(HttpStatusCode statusCode) {
		HttpStatus resolvedStatus = HttpStatus.resolve(statusCode.value());
		return resolvedStatus == null ? "Error" : resolvedStatus.getReasonPhrase();
	}
}
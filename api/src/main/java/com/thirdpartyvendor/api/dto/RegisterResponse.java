package com.thirdpartyvendor.api.dto;

public record RegisterResponse(
		Long userId,
		String firstName,
		String lastName,
		String email,
		String role) {
}
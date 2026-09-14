package com.thirdpartyvendor.api.dto;

import com.thirdpartyvendor.api.entity.UserRole;

public record RegisterResponse(
		Long userId,
		String firstName,
		String lastName,
		String email,
		UserRole userRole) {
}
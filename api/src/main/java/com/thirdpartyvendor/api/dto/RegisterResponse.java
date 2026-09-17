package com.thirdpartyvendor.api.dto;

import com.thirdpartyvendor.api.entity.AppUser.UserRole;

public record RegisterResponse(
		Long userId,
		String firstName,
		String lastName,
		String email,
		UserRole userRole) {
}
package com.thirdpartyvendor.api.dto;

import java.time.LocalDate;

public record RegisterRequest(
		String firstName,
		String lastName,
		String phoneNumber,
		LocalDate dateOfBirth,
		String email,
		String password) {
}
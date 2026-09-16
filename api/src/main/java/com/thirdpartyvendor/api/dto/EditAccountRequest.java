package com.thirdpartyvendor.api.dto;

import java.time.LocalDate;

public record EditAccountRequest (
    	String firstName,
		String lastName,
		String phoneNumber,
		LocalDate dateOfBirth,
		String email
	) {
}

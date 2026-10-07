package com.thirdpartyvendor.api.dto;

import java.time.LocalDate;

public record AuthenticationJwtModel(
    String firstName,
    String lastName,
    String phoneNumber,
    LocalDate dateOfBirth,
    String email,
    String jwtToken,
    Long userId
) {
    
}

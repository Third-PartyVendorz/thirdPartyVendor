package com.thirdpartyvendor.api.dto;
import java.time.LocalDate;

public record AuthenticationResponse(
    String jwtToken,
    String firstName,
    String lastName,
    String phoneNumber,
    LocalDate dateOfBirth,
    String email
) {
}
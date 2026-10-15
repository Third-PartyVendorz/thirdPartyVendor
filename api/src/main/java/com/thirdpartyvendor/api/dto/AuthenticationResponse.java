package com.thirdpartyvendor.api.dto;
import java.time.LocalDate;

public record AuthenticationResponse(
    Long userId,
    String firstName,
    String lastName,
    String phoneNumber,
    LocalDate dateOfBirth,
    String email,
    String role
) {
}
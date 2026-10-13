package com.thirdpartyvendor.api.dto;
import java.time.LocalDate;

public record AuthenticationResponse(
    String firstName,
    String lastName,
    String phoneNumber,
    LocalDate dateOfBirth,
    String email
) {
}
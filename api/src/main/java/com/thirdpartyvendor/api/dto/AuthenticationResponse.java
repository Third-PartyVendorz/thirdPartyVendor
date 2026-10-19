package com.thirdpartyvendor.api.dto;
import java.time.LocalDate;
import com.thirdpartyvendor.api.entity.AppUser.UserRole;

public record AuthenticationResponse(
    Long userId,
    String firstName,
    String lastName,
    String phoneNumber,
    LocalDate dateOfBirth,
    String email,
    UserRole role
) {
}
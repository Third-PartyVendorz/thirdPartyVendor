package com.thirdpartyvendor.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserResponse(
    Long userId,
    String firstName,
    String lastName,
    String phoneNumber,
    LocalDate dateOfBirth,
    String email,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    boolean frozen,
    boolean active
){}
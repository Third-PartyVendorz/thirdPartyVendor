package com.thirdpartyvendor.api.dto;

public record ChangePasswordRequest (
    String currentPassword,
    String newPassword,
    String confirmNewPassword
) {}

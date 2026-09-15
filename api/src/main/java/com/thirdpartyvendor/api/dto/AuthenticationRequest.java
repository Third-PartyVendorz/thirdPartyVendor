package com.thirdpartyvendor.api.dto;

public record AuthenticationRequest(
    String email,
    String password
) {
}
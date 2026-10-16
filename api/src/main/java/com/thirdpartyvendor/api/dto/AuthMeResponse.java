package com.thirdpartyvendor.api.dto;

import com.thirdpartyvendor.api.entity.AppUser.UserRole;

public record AuthMeResponse(UserRole role) {
    
}

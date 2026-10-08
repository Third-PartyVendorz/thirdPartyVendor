package com.thirdpartyvendor.api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.dto.UserResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.util.AuthorizationUtil;

@Service
public class AdminService {
    private final AppUserRepository userRepository;

    public AdminService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers(AppUser currentUser) {
        AuthorizationUtil.requireAdmin(currentUser);

        return userRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    private UserResponse mapToResponse(AppUser user) {
        return new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhoneNumber(),
            user.getDateOfBirth(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.isFrozen(),
            user.isActive()
        );
    }
}

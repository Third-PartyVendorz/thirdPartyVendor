package com.thirdpartyvendor.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.UserService;
import com.thirdpartyvendor.api.service.AdminService;
import com.thirdpartyvendor.api.dto.UserResponse;
import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final UserService userService;
    private final AdminService adminService;

    public AdminController(UserService userService, AdminService adminService) {
        this.userService = userService;
        this.adminService = adminService;
    }

    @PostMapping("/users/{userId}/freeze")
    public ResponseEntity<Void> freezeAccount(
        @PathVariable long userId,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        userService.freezeAccount(userId, currentUser);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/users/{userId}/unfreeze")
    public ResponseEntity<Void> unfreezeAccount(
        @PathVariable long userId,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        userService.unfreezeAccount(userId, currentUser);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/users/{userId}/soft-delete")
    public ResponseEntity<Void> softDeleteUser(
        @PathVariable Long userId,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        userService.softDeleteUser(userId, currentUser);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers(@AuthenticationPrincipal AppUser currentUser) {
        return adminService.getAllUsers(currentUser);
    }

}

package com.thirdpartyvendor.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.ChangePasswordRequest;
import com.thirdpartyvendor.api.dto.EditAccountRequest;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.UserService;

@RestController
@RequestMapping("/users/{userId}")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	private AppUser getCurrentUser() {
		return (AppUser) SecurityContextHolder.getContext()
			.getAuthentication().getPrincipal();
	}

	@PutMapping("/edit")
	public ResponseEntity<?> editAccount(
		@PathVariable Long userId,
		@RequestBody EditAccountRequest editAccountRequest
	) {
		AppUser currentUser = getCurrentUser();
		userService.editUser(userId, editAccountRequest, currentUser);
		return ResponseEntity.ok("Account updated successfully");
	}

	@PutMapping("/changePassword")
	public ResponseEntity<?> changePassword(
		@PathVariable Long userId,
		@RequestBody ChangePasswordRequest passwordRequest
	) {
		AppUser currentUser = getCurrentUser();
		userService.changePassword(userId, passwordRequest, currentUser);
		return ResponseEntity.ok("Password changed successfully");
	}

	// TODO: add route for deleting user
}
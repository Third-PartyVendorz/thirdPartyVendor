package com.thirdpartyvendor.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.ChangePasswordRequest;
import com.thirdpartyvendor.api.dto.EditAccountRequest;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@PutMapping("/edit")
	public ResponseEntity<?> editAccount(
		@AuthenticationPrincipal AppUser currentUser,
		@RequestBody EditAccountRequest editAccountRequest
	) {
		userService.editUser(editAccountRequest, currentUser);
		return ResponseEntity.ok("Account updated successfully");
	}

	@PutMapping("/changePassword")
	public ResponseEntity<?> changePassword(
		@AuthenticationPrincipal AppUser currentUser,
		@RequestBody ChangePasswordRequest passwordRequest
	) {
		userService.changePassword(passwordRequest, currentUser);
		return ResponseEntity.ok("Password changed successfully");
	}

	@DeleteMapping("/delete") 
	public ResponseEntity<?> deleteUser(
		@AuthenticationPrincipal AppUser currentUser
	) {
		userService.softDeleteUser(currentUser);
		return ResponseEntity.ok("Account updated successfully");
	}
}
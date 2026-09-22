package com.thirdpartyvendor.api.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.dto.ChangePasswordRequest;
import com.thirdpartyvendor.api.dto.EditAccountRequest;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.util.AuthorizationUtil;

@Service
public class UserService {

	private final AppUserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	/**
	 * Edit account information. Only accessible to the associated user and admins.
	 * @param userId
	 * @param updateRequest
	 * @param currentUser
	 */
	public void editUser(Long userId, EditAccountRequest updateRequest, AppUser currentUser) {
		AuthorizationUtil.requireOwnUserOrAdmin(userId, currentUser);

		AppUser user = userRepository.findById(userId)
			.orElseThrow(() -> new UserNotFoundException("User not found"));


		if (updateRequest.email() != null) {
			Optional<AppUser> userWithSameEmail = userRepository.findByEmail(updateRequest.email());
			if (!userWithSameEmail.isEmpty()) {
				if (!userWithSameEmail.get().getId().equals(userId)) {
					throw new EmailAlreadyInUseException("Email is already in use");
				}
			}
				
			user.setEmail(updateRequest.email());
		}

		if (updateRequest.firstName() != null) {
			user.setFirstName(updateRequest.firstName());
		}

		if (updateRequest.lastName() != null) {
			user.setLastName(updateRequest.lastName());
		}
		
		if (updateRequest.dateOfBirth() != null) {
			user.setDateOfBirth(updateRequest.dateOfBirth());
		}

		if (updateRequest.phoneNumber() != null) {
			user.setPhoneNumber(updateRequest.phoneNumber());
		}

		userRepository.save(user);
	}

	/**
	 * Change user password. Only accessible to the associated user.
	 * @param userId
	 * @param passwordRequest
	 * @param currentUser
	 */
	public void changePassword(Long userId, ChangePasswordRequest passwordRequest, AppUser currentUser) {
		AuthorizationUtil.requireOwnUser(userId, currentUser);

		AppUser user = userRepository.findById(userId)
			.orElseThrow(() -> new UserNotFoundException("User not found"));

		if (!passwordEncoder.matches(passwordRequest.currentPassword(), user.getPasswordHash())) {
			throw new PasswordException("Incorrect current password");
		}

		if (!passwordRequest.newPassword().equals(passwordRequest.confirmNewPassword())) {
			throw new PasswordException("New passwords don't match");
		}

		user.setPasswordHash(passwordEncoder.encode(passwordRequest.newPassword()));

		userRepository.save(user);
	}

	public void freezeAccount(Long userId, AppUser currentUser) {
		AuthorizationUtil.requireAdmin(currentUser);

		AppUser user = userRepository.findById(userId)
			.orElseThrow(() -> new UserNotFoundException("User not found"));

		user.setFrozen(true);

		userRepository.save(user);
	}

	public void unfreezeAccount(Long userId, AppUser currentUser) {
		AuthorizationUtil.requireAdmin(currentUser);

		AppUser user = userRepository.findById(userId)
			.orElseThrow(() -> new UserNotFoundException("User not found"));

		user.setFrozen(false);

		userRepository.save(user);
	}

	// TODO: functionality for deleting user

	public static class UserNotFoundException extends RuntimeException {
		public UserNotFoundException(String message) {
			super(message);
		}
	}

	public static class EmailAlreadyInUseException extends RuntimeException {
		public EmailAlreadyInUseException(String message) {
			super(message);
		}
	}

	public static class PasswordException extends RuntimeException {
		public PasswordException(String message) {
			super(message);
		}
	}
}

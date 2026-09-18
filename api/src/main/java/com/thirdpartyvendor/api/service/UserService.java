package com.thirdpartyvendor.api.service;

import java.util.Locale;
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

		String requestEmail = updateRequest.email().trim().toLowerCase(Locale.ROOT);
		
		if (requestEmail != null) {
			Optional<AppUser> userWithSameEmail = userRepository.findByEmail(requestEmail);
			if (!userWithSameEmail.isEmpty()) {
				if (!userWithSameEmail.get().getEmail().equals(requestEmail)) {
					throw new EmailAlreadyInUseException("Email is already in use");
				}
			}
				
			user.setEmail(requestEmail);
		}

		if (updateRequest.firstName() != null) {
			user.setFirstName(updateRequest.firstName().trim());
		}

		if (updateRequest.lastName() != null) {
			user.setLastName(updateRequest.lastName().trim());
		}
		
		if (updateRequest.dateOfBirth() != null) {
			user.setDateOfBirth(updateRequest.dateOfBirth());
		}

		if (updateRequest.phoneNumber() != null) {
			user.setPhoneNumber(updateRequest.phoneNumber().trim());
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

		if (!passwordEncoder.matches(passwordRequest.currentPassword().trim(), user.getPasswordHash())) {
			throw new PasswordException("Incorrect current password");
		}

		if (!passwordRequest.newPassword().trim().equals(passwordRequest.confirmNewPassword().trim())) {
			throw new PasswordException("New passwords don't match");
		}

		user.setPasswordHash(passwordEncoder.encode(passwordRequest.newPassword().trim()));

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

	public void softDeleteUser(Long userId, AppUser currenUser) {
		AuthorizationUtil.requireOwnUserOrAdmin(userId, currenUser);

		AppUser user = userRepository.findById(userId)
			.orElseThrow(() -> new UserNotFoundException("User not found"));

		user.setActive(false);

		userRepository.save(user);
	}

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

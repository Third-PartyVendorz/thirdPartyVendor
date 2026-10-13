package com.thirdpartyvendor.api.service;

import java.util.Locale;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.dto.ChangePasswordRequest;
import com.thirdpartyvendor.api.dto.EditAccountRequest;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.error.UserExceptions.EmailAlreadyInUseException;
import com.thirdpartyvendor.api.error.UserExceptions.PasswordException;
import com.thirdpartyvendor.api.error.UserExceptions.UserNotFoundException;
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
	 * Edit the authenticated user's account information.
	 * @param updateRequest
	 * @param currentUser
	 */
	public void editUser(EditAccountRequest updateRequest, AppUser currentUser) {

		AppUser user = userRepository.findById(currentUser.getId())
			.orElseThrow(() -> new UserNotFoundException("User not found"));

		// String requestEmail = updateRequest.email().trim().toLowerCase(Locale.ROOT);
		
		if (updateRequest.email() != null) {
			String requestEmail = updateRequest.email().trim().toLowerCase(Locale.ROOT);
			Optional<AppUser> userWithSameEmail = userRepository.findByEmail(requestEmail);
			if (!userWithSameEmail.isEmpty()) {
				if (!userWithSameEmail.get().getId().equals(currentUser.getId())) {
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
	 * Change the authenticated user's password.
	 * @param passwordRequest
	 * @param currentUser
	 */
	public void changePassword(ChangePasswordRequest passwordRequest, AppUser currentUser) {

		AppUser user = userRepository.findById(currentUser.getId())
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

	public void softDeleteUser(AppUser currentUser) {

		AppUser user = userRepository.findById(currentUser.getId())
			.orElseThrow(() -> new UserNotFoundException("User not found"));

		user.setActive(false);

		userRepository.save(user);
	}

}

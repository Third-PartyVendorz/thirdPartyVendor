package com.thirdpartyvendor.api.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.RegisterRequest;
import com.thirdpartyvendor.api.dto.RegisterResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.AppUser.UserRole;
import com.thirdpartyvendor.api.repository.AppUserRepository;

@Service
public class RegistrationService {

	private static final UserRole DEFAULT_ROLE = UserRole.USER;

	private final AppUserRepository appUserRepository;
	private final PasswordEncoder passwordEncoder;

	public RegistrationService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
		this.appUserRepository = appUserRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public RegisterResponse register(RegisterRequest request) {
		String firstName = requireText(request.firstName(), "First name is required");
		String lastName = requireText(request.lastName(), "Last name is required");
		String email = requireText(request.email(), "Email is required").toLowerCase(Locale.ROOT);
		String password = requireText(request.password(), "Password is required");

		if (request.dateOfBirth() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date of birth is required");
		}

		if (appUserRepository.findByEmail(email).isPresent()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
		}

		AppUser user = new AppUser();
		user.setFirstName(firstName);
		user.setLastName(lastName);
		user.setPhoneNumber(StringUtils.hasText(request.phoneNumber()) ? request.phoneNumber().trim() : null);
		user.setDateOfBirth(request.dateOfBirth());
		user.setEmail(email);
		user.setPasswordHash(passwordEncoder.encode(password));
		user.setRole(DEFAULT_ROLE);
		user.setActive(true);

		AppUser savedUser = appUserRepository.save(user);
		return new RegisterResponse(savedUser.getId(), savedUser.getFirstName(), savedUser.getLastName(), savedUser.getEmail(), savedUser.getRole());
	}
	private String requireText(String value, String message) {
		if (!StringUtils.hasText(value)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
		}

		return value.trim();
	}
}
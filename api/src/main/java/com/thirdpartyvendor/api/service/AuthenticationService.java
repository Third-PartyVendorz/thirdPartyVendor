package com.thirdpartyvendor.api.service;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.AuthenticationRequest;
import com.thirdpartyvendor.api.dto.AuthenticationResponse;
import com.thirdpartyvendor.api.dto.AuthenticationJwtModel;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.entity.AppUser;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@Service
public class AuthenticationService {

	private final AppUserRepository appUserRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final ConcurrentHashMap<String, AtomicInteger> failedLoginAttempts = new ConcurrentHashMap<>();
	private static final Logger logger = LogManager.getLogger(AuthenticationService.class);

	public AuthenticationService(
			AppUserRepository appUserRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService) {
		this.appUserRepository = appUserRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public AuthenticationJwtModel authenticate(AuthenticationRequest request) {
		String email = normalizeEmail(request.email());
		String password = request.password() == null ? null : request.password().trim();

		if (email == null || email.isBlank() || password == null || password.isBlank()) {
			logger.warn("Authentication rejected: email or password was not provided");
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
		}

		AppUser user = appUserRepository.findByEmailAndActiveTrue(email)
			.orElseThrow(() -> {
				recordFailedLogin(email);
				logger.warn("Authentication failed: active user was not found");
				return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
			});

		if (!passwordEncoder.matches(password, user.getPasswordHash())) {
			recordFailedLogin(email);
			logger.warn("Authentication failed for user id {}: invalid email or password", user.getId());
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
		}

		failedLoginAttempts.remove(email);
		logger.info("Authentication succeeded for user id {}", user.getId());

		return new AuthenticationJwtModel(
			user.getFirstName(),
			user.getLastName(),
			user.getPhoneNumber(),
			user.getDateOfBirth(),
			user.getEmail(),
			jwtService.generateToken(user),
			user.getId()
		);
	}

	private void recordFailedLogin(String email) {
		int attemptCount = failedLoginAttempts
			.computeIfAbsent(email, ignored -> new AtomicInteger())
			.incrementAndGet();

		if (attemptCount > 3) {
			logger.warn("More than 3 consecutive authentication failures for the same account (attempt {})", attemptCount);
		}
	}

	private String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
	}

}
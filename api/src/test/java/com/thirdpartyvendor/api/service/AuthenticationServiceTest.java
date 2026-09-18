package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.AuthenticationRequest;
import com.thirdpartyvendor.api.dto.AuthenticationResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.AppUser.UserRole;
import com.thirdpartyvendor.api.repository.AppUserRepository;

class AuthenticationServiceTest {

	private static final String TEST_JWT_SECRET = "Y2hhbmdlLW1lLWluLXByb2QtdG8tYS1sb25nLXNlY3JldC1rZXktZm9yLWp3dA==";

	private final AppUserRepository appUserRepository = mock(AppUserRepository.class);
	private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
	private final JwtService jwtService = new JwtService(TEST_JWT_SECRET, 86400000L);
	private final AuthenticationService authenticationService = new AuthenticationService(appUserRepository, passwordEncoder, jwtService);

	@Test
	void authenticatesValidUser() {
		AppUser user = new AppUser();
		user.setId(1L);
		user.setEmail("jane.doe@example.com");
		user.setPasswordHash(passwordEncoder.encode("secret123"));
		user.setRole(UserRole.USER);

		when(appUserRepository.findByEmailAndActiveTrue("jane.doe@example.com")).thenReturn(Optional.of(user));

		AuthenticationResponse response = authenticationService.authenticate(new AuthenticationRequest(
			"jane.doe@example.com",
			"secret123"));

		assertNotNull(response.jwtToken());
		assertEquals(true, response.jwtToken().length() > 0);
	}

	@Test
	void rejectsBadPassword() {
		AppUser user = new AppUser();
		user.setId(1L);
		user.setEmail("jane.doe@example.com");
		user.setPasswordHash(passwordEncoder.encode("secret123"));
		user.setRole(UserRole.USER);

		when(appUserRepository.findByEmailAndActiveTrue("jane.doe@example.com")).thenReturn(Optional.of(user));

		ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> authenticationService.authenticate(new AuthenticationRequest(
			"jane.doe@example.com",
			"wrong-password")));

		assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
	}
}
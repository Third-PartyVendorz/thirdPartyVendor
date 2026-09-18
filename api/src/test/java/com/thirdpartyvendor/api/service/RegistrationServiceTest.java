package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.RegisterRequest;
import com.thirdpartyvendor.api.dto.RegisterResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.AppUser.UserRole;
import com.thirdpartyvendor.api.repository.AppUserRepository;

class RegistrationServiceTest {

	private final AppUserRepository appUserRepository = mock(AppUserRepository.class);
	private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
	private final RegistrationService registrationService = new RegistrationService(appUserRepository, passwordEncoder);

	@Test
	void registersNewUser() {
		when(appUserRepository.findByEmail("jane.doe@example.com")).thenReturn(Optional.empty());
		when(appUserRepository.save(org.mockito.ArgumentMatchers.any(AppUser.class))).thenAnswer(invocation -> {
			AppUser user = invocation.getArgument(0);
			user.setId(1L);
			return user;
		});

		RegisterResponse response = registrationService.register(new RegisterRequest(
			"Jane",
			"Doe",
			"555-0102",
			LocalDate.of(1992, 8, 22),
			"jane.doe@example.com",
			"secret123"));

		assertNotNull(response.userId());
		assertEquals(1L, response.userId());
		assertEquals("Jane", response.firstName());
		assertEquals("Doe", response.lastName());
		assertEquals("jane.doe@example.com", response.email());
		assertEquals(UserRole.USER, response.userRole());
	}

	@Test
	void rejectsDuplicateEmail() {
		AppUser existingUser = new AppUser();
		existingUser.setEmail("jane.doe@example.com");
		when(appUserRepository.findByEmail("jane.doe@example.com")).thenReturn(Optional.of(existingUser));

		ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> registrationService.register(new RegisterRequest(
			"Jane",
			"Doe",
			null,
			LocalDate.of(1992, 8, 22),
			"jane.doe@example.com",
			"secret123")));

		assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
	}
}
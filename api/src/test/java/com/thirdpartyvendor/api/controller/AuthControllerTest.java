package com.thirdpartyvendor.api.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.AuthenticationJwtModel;
import com.thirdpartyvendor.api.dto.AuthenticationRequest;
import com.thirdpartyvendor.api.dto.AuthenticationResponse;
import com.thirdpartyvendor.api.dto.AuthMeResponse;
import com.thirdpartyvendor.api.dto.RegisterRequest;
import com.thirdpartyvendor.api.dto.RegisterResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.AppUser.UserRole;
import com.thirdpartyvendor.api.entity.RefreshToken;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.service.AuthenticationService;
import com.thirdpartyvendor.api.service.JwtService;
import com.thirdpartyvendor.api.service.RefreshService;
import com.thirdpartyvendor.api.service.RegistrationService;

class AuthControllerTest {

	private final RegistrationService registrationService = mock(RegistrationService.class);
	private final AuthenticationService authenticationService = mock(AuthenticationService.class);
	private final RefreshService refreshService = mock(RefreshService.class);
	private final JwtService jwtService = mock(JwtService.class);
	private final AppUserRepository appUserRepository = mock(AppUserRepository.class);
	private final AuthController authController = new AuthController(
		registrationService,
		authenticationService,
		refreshService,
		jwtService,
		appUserRepository
	);

	private MockHttpServletRequest request;
	private MockHttpServletResponse response;

	@BeforeEach
	void setUp() {
		request = new MockHttpServletRequest();
		request.setSecure(false);
		response = new MockHttpServletResponse();
	}

	@Test
	void registersNewUser() {
		RegisterResponse registerResponse = new RegisterResponse(1L, "Jane", "Doe", "jane.doe@example.com", UserRole.USER);
		when(registrationService.register(org.mockito.ArgumentMatchers.any(RegisterRequest.class))).thenReturn(registerResponse);

		ResponseEntity<RegisterResponse> result = authController.register(new RegisterRequest(
			"Jane",
			"Doe",
			"555-0102",
			LocalDate.of(1992, 8, 22),
			"jane.doe@example.com",
			"secret123"
		));

		assertEquals(HttpStatus.CREATED, result.getStatusCode());
		assertEquals(registerResponse, result.getBody());
	}

	@Test
	void authenticatesUserAndSetsCookies() {
		AppUser user = createUser(1L, "jane.doe@example.com");
		when(authenticationService.authenticate(org.mockito.ArgumentMatchers.any(AuthenticationRequest.class))).thenReturn(
			new AuthenticationJwtModel("Jane", "Doe", "555-0102", LocalDate.of(1992, 8, 22), "jane.doe@example.com", "jwt-token", 1L, UserRole.USER)
		);
		when(refreshService.createRefreshToken(1L)).thenReturn(createRefreshToken("refresh-token", user));
		when(appUserRepository.findById(1L)).thenReturn(Optional.of(user));

		ResponseEntity<AuthenticationResponse> result = authController.authenticate(
			new AuthenticationRequest("jane.doe@example.com", "secret123"),
			request,
			response
		);

		assertEquals(HttpStatus.OK, result.getStatusCode());
		assertEquals("jane.doe@example.com", result.getBody().email());
		assertEquals(UserRole.USER, result.getBody().role());
		assertEquals(2, response.getHeaders(HttpHeaders.SET_COOKIE).size());
		assertNull(result.getHeaders().getFirst(HttpHeaders.SET_COOKIE));
	}

	@Test
	void returnsMeWhenPrincipalExists() {
		ResponseEntity<AuthMeResponse> result = authController.me(createUser(1L, "jane.doe@example.com"));

		assertEquals(HttpStatus.OK, result.getStatusCode());
		assertEquals(UserRole.USER, result.getBody().role());
	}

	@Test
	void throwsUnauthorizedWhenPrincipalMissing() {
		ResponseStatusException exception = org.junit.jupiter.api.Assertions.assertThrows(
			ResponseStatusException.class,
			() -> authController.me(null)
		);

		assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
	}

	@Test
	void refreshRotatesRefreshTokenAndIssuesNewCookies() {
		AppUser user = createUser(1L, "jane.doe@example.com");
		RefreshToken rotatedToken = createRefreshToken("rotated-token", user);
		request.setCookies(new jakarta.servlet.http.Cookie("refreshToken", "refresh-token"));
		when(refreshService.rotateRefreshToken("refresh-token")).thenReturn(rotatedToken);
		when(jwtService.generateToken(user)).thenReturn("new-jwt");

		ResponseEntity<AuthMeResponse> result = authController.refresh(request, response);

		assertEquals(HttpStatus.OK, result.getStatusCode());
		assertEquals(2, response.getHeaders(HttpHeaders.SET_COOKIE).size());
		verify(jwtService).generateToken(user);
		assertEquals(new AuthMeResponse(UserRole.USER, false), result.getBody());
	}

	@Test
	void refreshRejectsMissingRefreshCookie() {
		ResponseStatusException exception = org.junit.jupiter.api.Assertions.assertThrows(
			ResponseStatusException.class,
			() -> authController.refresh(request, response)
		);

		assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
		verify(refreshService, never()).rotateRefreshToken(org.mockito.ArgumentMatchers.anyString());
	}

	@Test
	void logoutRevokesRefreshTokenWhenPresentAndClearsCookies() {
		request.setCookies(new jakarta.servlet.http.Cookie("refreshToken", "refresh-token"));

		ResponseEntity<Void> result = authController.logout(request, response);

		assertEquals(HttpStatus.OK, result.getStatusCode());
		verify(refreshService).revokeRefreshToken("refresh-token");
		assertEquals(2, response.getHeaders(HttpHeaders.SET_COOKIE).size());
	}

	@Test
	void logoutStillClearsCookiesWithoutRefreshToken() {
		ResponseEntity<Void> result = authController.logout(request, response);

		assertEquals(HttpStatus.OK, result.getStatusCode());
		verify(refreshService, never()).revokeRefreshToken(org.mockito.ArgumentMatchers.anyString());
		assertEquals(2, response.getHeaders(HttpHeaders.SET_COOKIE).size());
	}

	private AppUser createUser(Long id, String email) {
		AppUser user = new AppUser();
		user.setId(id);
		user.setEmail(email);
		user.setRole(UserRole.USER);
		user.setActive(true);
		return user;
	}

	private RefreshToken createRefreshToken(String tokenValue, AppUser user) {
		RefreshToken token = new RefreshToken();
		token.setToken(tokenValue);
		token.setUser(user);
		return token;
	}
}
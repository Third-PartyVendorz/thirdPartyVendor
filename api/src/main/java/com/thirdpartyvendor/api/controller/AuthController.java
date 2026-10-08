package com.thirdpartyvendor.api.controller;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.thirdpartyvendor.api.dto.AuthenticationJwtModel;
import com.thirdpartyvendor.api.dto.AuthenticationRequest;
import com.thirdpartyvendor.api.dto.AuthenticationResponse;
import com.thirdpartyvendor.api.dto.RegisterRequest;
import com.thirdpartyvendor.api.dto.RegisterResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.RefreshToken;
import com.thirdpartyvendor.api.service.AuthenticationService;
import com.thirdpartyvendor.api.service.JwtService;
import com.thirdpartyvendor.api.service.RefreshService;
import com.thirdpartyvendor.api.service.RegistrationService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final RegistrationService registrationService;
	private final AuthenticationService authenticationService;
	private final RefreshService refreshService;
	private final JwtService jwtService;

	@Value("${app.jwt.expiration-ms}")
	private long jwtExpirationMs;

	@Value("${app.jwt.refresh-expiration-ms}")
	private long refreshExpirationMs;

	public AuthController(
			RegistrationService registrationService,
			AuthenticationService authenticationService,
			RefreshService refreshService,
			JwtService jwtService) {
		this.registrationService = registrationService;
		this.authenticationService = authenticationService;
		this.refreshService = refreshService;
		this.jwtService = jwtService;
	}

	@PostMapping("/register")
	public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.register(request));
	}

	@PostMapping("/authenticate")
	public ResponseEntity<AuthenticationResponse> authenticate(
			@RequestBody AuthenticationRequest request,
			HttpServletRequest httpRequest,
			HttpServletResponse response) {
		AuthenticationJwtModel authJwtModel = authenticationService.authenticate(request);
		RefreshToken refreshToken = refreshService.createRefreshToken(authJwtModel.userId());

		response.addHeader(HttpHeaders.SET_COOKIE, buildAuthCookie(httpRequest, authJwtModel.jwtToken()).toString());
		response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(httpRequest, refreshToken.getToken()).toString());

		AuthenticationResponse authResponse = new AuthenticationResponse(
			authJwtModel.firstName(),
			authJwtModel.lastName(),
			authJwtModel.phoneNumber(),
			authJwtModel.dateOfBirth(),
			authJwtModel.email()
		);
		return ResponseEntity.status(HttpStatus.OK).body(authResponse);
	}

	@GetMapping("/me")
	public ResponseEntity<Void> me(@AuthenticationPrincipal AppUser currentUser) {
		if (currentUser == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please login again");
		}

		return ResponseEntity.ok().build();
	}

	@PostMapping("/refresh")
	public ResponseEntity<Void> refresh(
			HttpServletRequest httpRequest,
			HttpServletResponse response) {
		String refreshToken = getCookieValue(httpRequest, "refreshToken");
		if (refreshToken == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please login again");
		}

		RefreshToken rotatedRefreshToken = refreshService.rotateRefreshToken(refreshToken);
		if (rotatedRefreshToken == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please login again");
		}

		response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(httpRequest, rotatedRefreshToken.getToken()).toString());
		response.addHeader(HttpHeaders.SET_COOKIE, buildAuthCookie(httpRequest, jwtService.generateToken(rotatedRefreshToken.getUser())).toString());

		return ResponseEntity.ok().build();
	}

	private String getCookieValue(HttpServletRequest request, String cookieName) {
		if (request.getCookies() == null) {
			return null;
		}

		for (var cookie : request.getCookies()) {
			if (cookieName.equals(cookie.getName())) {
				return cookie.getValue();
			}
		}

		return null;
	}

	private ResponseCookie buildAuthCookie(HttpServletRequest request, String value) {
		return ResponseCookie.from("authToken", value)
			.httpOnly(true)
			.secure(request.isSecure())
			.path("/")
			.maxAge(Duration.ofMillis(jwtExpirationMs))
			.sameSite("Strict")
			.build();
	}

	private ResponseCookie buildRefreshCookie(HttpServletRequest request, String value) {
		return ResponseCookie.from("refreshToken", value)
			.httpOnly(true)
			.secure(request.isSecure())
			.path("/auth/refresh")
			.maxAge(Duration.ofMillis(refreshExpirationMs))
			.sameSite("Strict")
			.build();
	}
}
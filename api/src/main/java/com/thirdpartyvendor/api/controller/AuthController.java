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

import com.thirdpartyvendor.api.dto.AuthenticationJwtModel;
import com.thirdpartyvendor.api.dto.AuthenticationRequest;
import com.thirdpartyvendor.api.dto.AuthenticationResponse;
import com.thirdpartyvendor.api.dto.RegisterRequest;
import com.thirdpartyvendor.api.dto.RegisterResponse;
import com.thirdpartyvendor.api.entity.RefreshToken;
import com.thirdpartyvendor.api.service.AuthenticationService;
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

	@Value("${app.jwt.expiration-ms}")
	private long jwtExpirationMs;

	public AuthController(RegistrationService registrationService, AuthenticationService authenticationService, RefreshService refreshService) {
		this.registrationService = registrationService;
		this.authenticationService = authenticationService;
		this.refreshService = refreshService;
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
		ResponseCookie authCookie = ResponseCookie.from("authToken", authJwtModel.jwtToken())
			.httpOnly(true)
			.secure(httpRequest.isSecure())
			.path("/")
			.maxAge(Duration.ofMillis(jwtExpirationMs))
			.sameSite("Strict")
			.build();
		ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
			.httpOnly(true)
			.secure(httpRequest.isSecure())
			.path("/auth/refresh")
			.maxAge(Duration.ofMillis(jwtExpirationMs))
			.sameSite("Strict")
			.build();
		response.addHeader(HttpHeaders.SET_COOKIE, authCookie.toString());
		response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
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
	public ResponseEntity<Void> me() {
		return ResponseEntity.ok().build();
	}

	@PostMapping("/refresh")
	public ResponseEntity<Void> refresh(
			HttpServletRequest httpRequest,
			HttpServletResponse response) {
		String refreshToken = null;
		for (var cookie : httpRequest.getCookies()) {
				if ("refreshToken".equals(cookie.getName())) {
					refreshToken = cookie.getValue();
					break;
				}
		}
		if (refreshToken == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please login again");
		}

		return ResponseEntity.ok().build();
		


	}
}
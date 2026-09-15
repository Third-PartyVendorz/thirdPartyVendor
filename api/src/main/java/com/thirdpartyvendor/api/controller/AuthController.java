package com.thirdpartyvendor.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thirdpartyvendor.api.dto.RegisterRequest;
import com.thirdpartyvendor.api.dto.RegisterResponse;
import com.thirdpartyvendor.api.dto.AuthenticationRequest;
import com.thirdpartyvendor.api.dto.AuthenticationResponse;
import com.thirdpartyvendor.api.service.AuthenticationService;
import com.thirdpartyvendor.api.service.RegistrationService;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final RegistrationService registrationService;
	private final AuthenticationService authenticationService;

	public AuthController(RegistrationService registrationService, AuthenticationService authenticationService) {
		this.registrationService = registrationService;
		this.authenticationService = authenticationService;
	}

	@PostMapping("/register")
	public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.register(request));
	}

	@PostMapping("/authenticate")
	public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
		return ResponseEntity.status(HttpStatus.OK).body(authenticationService.authenticate(request));
	}
}
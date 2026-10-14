package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.AppUser.UserRole;

class JwtServiceTest {

	private static final String TEST_JWT_SECRET = "Y2hhbmdlLW1lLWluLXByb2QtdG8tYS1sb25nLXNlY3JldC1rZXktZm9yLWp3dA==";

	private final JwtService jwtService = new JwtService(TEST_JWT_SECRET, 86_400_000L);

	@Test
	void generatesTokenWithEmailSubject() {
		AppUser user = new AppUser();
		user.setId(7L);
		user.setEmail("jane.doe@example.com");
		user.setRole(UserRole.USER);

		String token = jwtService.generateToken(user);

		assertNotNull(token);
		assertEquals("jane.doe@example.com", jwtService.extractEmail(token));
		assertTrue(jwtService.isTokenValid(token, "jane.doe@example.com"));
	}

	@Test
	void rejectsTokensForDifferentEmails() {
		AppUser user = new AppUser();
		user.setId(7L);
		user.setEmail("jane.doe@example.com");
		user.setRole(UserRole.USER);

		String token = jwtService.generateToken(user);

		assertFalse(jwtService.isTokenValid(token, "someone.else@example.com"));
	}

	@Test
	void rejectsMalformedTokens() {
		assertFalse(jwtService.isTokenValid("not-a-token", "jane.doe@example.com"));
	}
}
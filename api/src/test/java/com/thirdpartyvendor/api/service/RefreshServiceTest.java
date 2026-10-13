package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.RefreshToken;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.repository.RefreshRepository;

class RefreshServiceTest {

	private final RefreshRepository refreshRepository = mock(RefreshRepository.class);
	private final AppUserRepository userRepository = mock(AppUserRepository.class);
	private final RefreshService refreshService = new RefreshService(refreshRepository, userRepository);

	RefreshServiceTest() {
		ReflectionTestUtils.setField(refreshService, "refreshExpirationMs", 60_000L);
	}

	@Test
	void createsRefreshTokenForExistingUser() {
		AppUser user = createUser(1L, "jane.doe@example.com");
		when(refreshRepository.findByUser_Id(1L)).thenReturn(Optional.empty());
		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(refreshRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

		RefreshToken token = refreshService.createRefreshToken(1L);

		assertNotNull(token.getToken());
		assertNotNull(token.getExpiryDate());
		assertSame(user, token.getUser());
		verify(refreshRepository).save(any(RefreshToken.class));
	}

	@Test
	void rotatesActiveRefreshToken() {
		RefreshToken token = new RefreshToken();
		token.setToken("current-token");
		token.setExpiryDate(Instant.now().plusSeconds(60));
		when(refreshRepository.findByToken("current-token")).thenReturn(Optional.of(token));
		when(refreshRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

		RefreshToken rotatedToken = refreshService.rotateRefreshToken("current-token");

		assertNotNull(rotatedToken);
		assertFalse("current-token".equals(rotatedToken.getToken()));
		assertTrue(rotatedToken.getExpiryDate().isAfter(Instant.now().minusSeconds(1)));
		verify(refreshRepository).save(token);
	}

	@Test
	void returnsNullWhenRefreshTokenIsMissing() {
		when(refreshRepository.findByToken("missing-token")).thenReturn(Optional.empty());

		RefreshToken rotatedToken = refreshService.rotateRefreshToken("missing-token");

		assertNull(rotatedToken);
		verify(refreshRepository, never()).save(any(RefreshToken.class));
	}

	@Test
	void returnsNullWhenRefreshTokenIsExpired() {
		RefreshToken token = new RefreshToken();
		token.setToken("expired-token");
		token.setExpiryDate(Instant.now().minusSeconds(60));
		when(refreshRepository.findByToken("expired-token")).thenReturn(Optional.of(token));

		RefreshToken rotatedToken = refreshService.rotateRefreshToken("expired-token");

		assertNull(rotatedToken);
		verify(refreshRepository, never()).save(any(RefreshToken.class));
	}

	@Test
	void revokesRefreshTokenWhenPresent() {
		RefreshToken token = new RefreshToken();
		token.setToken("refresh-token");
		when(refreshRepository.findByToken("refresh-token")).thenReturn(Optional.of(token));

		refreshService.revokeRefreshToken("refresh-token");

		verify(refreshRepository).delete(token);
	}

	@Test
	void doesNothingWhenRevokingMissingRefreshToken() {
		when(refreshRepository.findByToken("missing-token")).thenReturn(Optional.empty());

		refreshService.revokeRefreshToken("missing-token");

		verify(refreshRepository, never()).delete(any(RefreshToken.class));
	}

	@Test
	void detectsExpiredRefreshToken() {
		RefreshToken token = new RefreshToken();
		token.setExpiryDate(Instant.now().minusSeconds(1));

		assertTrue(refreshService.isRefreshTokenExpired(token));
	}

	private AppUser createUser(Long id, String email) {
		AppUser user = new AppUser();
		user.setId(id);
		user.setEmail(email);
		user.setPasswordHash(new BCryptPasswordEncoder().encode("secret123"));
		user.setActive(true);
		return user;
	}
}
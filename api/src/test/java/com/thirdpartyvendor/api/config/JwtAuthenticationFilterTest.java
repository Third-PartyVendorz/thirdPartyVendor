package com.thirdpartyvendor.api.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.AppUser.UserRole;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class JwtAuthenticationFilterTest {

	private final JwtService jwtService = mock(JwtService.class);
	private final AppUserRepository appUserRepository = mock(AppUserRepository.class);
	private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, appUserRepository);
	private final FilterChain filterChain = mock(FilterChain.class);

	@BeforeEach
	void setUp() {
		SecurityContextHolder.clearContext();
	}

	@Test
	void skipsPublicEndpoints() throws ServletException, IOException {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/auth/authenticate");
		MockHttpServletResponse response = new MockHttpServletResponse();

		filter.doFilter(request, response, filterChain);

		verify(filterChain).doFilter(request, response);
		verify(jwtService, never()).extractEmail(anyString());
		assertNull(SecurityContextHolder.getContext().getAuthentication());
	}

	@Test
	void authenticatesUserFromAuthCookie() throws ServletException, IOException {
		AppUser user = createUser(1L, "jane.doe@example.com");
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/orders");
		request.setCookies(new Cookie("authToken", "cookie-token"));
		MockHttpServletResponse response = new MockHttpServletResponse();

		when(jwtService.extractEmail("cookie-token")).thenReturn("jane.doe@example.com");
		when(jwtService.isTokenValid("cookie-token", "jane.doe@example.com")).thenReturn(true);
		when(appUserRepository.findByEmailAndActiveTrue("jane.doe@example.com")).thenReturn(Optional.of(user));

		filter.doFilter(request, response, filterChain);

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		assertEquals(user, authentication.getPrincipal());
		assertEquals("ROLE_USER", authentication.getAuthorities().iterator().next().getAuthority());
		verify(filterChain).doFilter(request, response);
	}

	@Test
	void returnsUnauthorizedForInvalidToken() throws ServletException, IOException {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/orders");
		request.setCookies(new Cookie("authToken", "bad-token"));
		MockHttpServletResponse response = new MockHttpServletResponse();

		when(jwtService.extractEmail("bad-token")).thenThrow(new RuntimeException("bad jwt"));

		filter.doFilter(request, response, filterChain);

		assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus());
		assertEquals("Invalid JWT", response.getErrorMessage());
		assertNull(SecurityContextHolder.getContext().getAuthentication());
		verify(filterChain, never()).doFilter(request, response);
	}

	@Test
	void continuesWithoutAuthenticationWhenTokenIsMissing() throws ServletException, IOException {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/orders");
		MockHttpServletResponse response = new MockHttpServletResponse();

		filter.doFilter(request, response, filterChain);

		verify(filterChain).doFilter(request, response);
		assertNull(SecurityContextHolder.getContext().getAuthentication());
	}

	private AppUser createUser(Long id, String email) {
		AppUser user = new AppUser();
		user.setId(id);
		user.setEmail(email);
		user.setRole(UserRole.USER);
		user.setActive(true);
		return user;
	}
}
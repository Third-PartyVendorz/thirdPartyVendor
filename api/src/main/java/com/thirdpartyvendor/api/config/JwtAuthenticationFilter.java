package com.thirdpartyvendor.api.config;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final AppUserRepository appUserRepository;

	public JwtAuthenticationFilter(JwtService jwtService, AppUserRepository appUserRepository) {
		this.jwtService = jwtService;
		this.appUserRepository = appUserRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		String token = authorizationHeader.substring(7);

		try {
			String email = jwtService.extractEmail(token);
			if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				AppUser user = appUserRepository.findByEmailAndActiveTrue(email).orElse(null);
				if (user != null && jwtService.isTokenValid(token, user.getEmail())) {
					UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
							// user.getId(),
							user.getEmail(),
							null,
							List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().toString())));
					SecurityContextHolder.getContext().setAuthentication(authentication);
				}
			}
		} catch (Exception exception) {
			SecurityContextHolder.clearContext();
		}

		filterChain.doFilter(request, response);
	}
}
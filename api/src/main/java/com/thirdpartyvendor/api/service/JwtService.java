package com.thirdpartyvendor.api.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.entity.AppUser;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private final SecretKey secretKey;
	private final long expirationMs;

	public JwtService(
			@Value("${app.jwt.secret}") String jwtSecret,
			@Value("${app.jwt.expiration-ms}") long expirationMs) {
		this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
		this.expirationMs = expirationMs;
	}

	public String generateToken(AppUser user) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + expirationMs);

		return Jwts.builder()
			.subject(user.getEmail())
			.claim("userId", user.getId())
			.claim("role", user.getRole())
			.issuedAt(now)
			.expiration(expiry)
			.signWith(secretKey)
			.compact();
	}

	public String extractEmail(String token) {
		return Jwts.parser()
			.verifyWith(secretKey)
			.build()
			.parseSignedClaims(token)
			.getPayload()
			.getSubject();
	}

	public boolean isTokenValid(String token, String email) {
		try {
			String tokenEmail = extractEmail(token);
			return tokenEmail != null && tokenEmail.equalsIgnoreCase(email);
		} catch (JwtException | IllegalArgumentException exception) {
			return false;
		}
	}
}
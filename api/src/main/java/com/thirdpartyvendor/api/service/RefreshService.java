package com.thirdpartyvendor.api.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.entity.RefreshToken;
import com.thirdpartyvendor.api.repository.RefreshRepository;
import com.thirdpartyvendor.api.repository.AppUserRepository;

@Service 
public class RefreshService {

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private final RefreshRepository refreshRepository;
    private final AppUserRepository userRepository;

    public RefreshService(RefreshRepository refreshRepository, AppUserRepository userRepository) {
        this.refreshRepository = refreshRepository;
        this.userRepository = userRepository;
    }

    public RefreshToken createRefreshToken(Long userId) {
        RefreshToken token = new RefreshToken();
        token.setUser(userRepository.findById(userId).get());
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));
        return refreshRepository.save(token);
    }
    
    public boolean isRefreshTokenExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(Instant.now());
    }


    public RefreshToken rotateRefreshToken(String refreshToken) {
        RefreshToken existingToken = refreshRepository.findByToken(refreshToken).orElse(null);
        if (existingToken != null && !isRefreshTokenExpired(existingToken)) {
            existingToken.setToken(UUID.randomUUID().toString());
            existingToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));
            return refreshRepository.save(existingToken);
        }
        return null;

    }
}

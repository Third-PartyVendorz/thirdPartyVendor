package com.thirdpartyvendor.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thirdpartyvendor.api.entity.RefreshToken;


public interface RefreshRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser_Id(Long userId);
}

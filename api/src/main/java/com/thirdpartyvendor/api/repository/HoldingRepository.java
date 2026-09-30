package com.thirdpartyvendor.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thirdpartyvendor.api.entity.Holding;
import com.thirdpartyvendor.api.entity.HoldingId;

public interface HoldingRepository extends JpaRepository<Holding, HoldingId> {
    Optional<Holding> findByTickerAndUserId(String ticker, Long userId);
    Optional<Holding> findFirstByTicker(String ticker);
    List<Holding> findByUserId(Long userId);
}
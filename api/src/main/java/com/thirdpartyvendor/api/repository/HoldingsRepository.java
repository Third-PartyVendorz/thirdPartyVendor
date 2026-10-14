package com.thirdpartyvendor.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.thirdpartyvendor.api.entity.Holding;
import com.thirdpartyvendor.api.entity.HoldingId;

public interface HoldingsRepository extends JpaRepository<Holding, HoldingId> {
    List<Holding> findByUserId(Long userId);
    
    Optional<Holding> findByUserIdAndTicker(Long userId, String ticker);
}
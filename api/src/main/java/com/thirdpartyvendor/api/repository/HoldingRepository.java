package com.thirdpartyvendor.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thirdpartyvendor.api.entity.Holding;
import com.thirdpartyvendor.api.entity.HoldingId;

public interface HoldingRepository extends JpaRepository<Holding, HoldingId> {
    Optional<Holding> findByAssetIdAndUserId(Long assetId, Long userId);
    Optional<Holding> findFirstByAssetId(Long assetId);
    List<Holding> findByUserId(Long userId);
}
package com.thirdpartyvendor.api.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.thirdpartyvendor.api.entity.Holding;

public interface HoldingsRepository extends JpaRepository<Holding, Long> {
    List<Holding> findByUserId(Long userId);
}
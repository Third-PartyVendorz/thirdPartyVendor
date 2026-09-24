package com.thirdpartyvendor.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thirdpartyvendor.api.entity.ForexLog;
import java.util.List;

public interface ForexLogRepository extends JpaRepository<ForexLog, Long> {
   
    Optional<ForexLog> findByExchangeId(Long exchangeId);

    List<ForexLog> findByUserId(Long userId);
}

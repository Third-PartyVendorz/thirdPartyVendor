package com.thirdpartyvendor.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thirdpartyvendor.api.entity.CashHolding;

public interface CashHoldingsRepository extends JpaRepository<CashHolding, Long> {
    Optional<CashHolding> findByUserId(Long userId);
    Optional<CashHolding> findByUserIdAndCurrencyCode(Long userId, String currencyCode);
}

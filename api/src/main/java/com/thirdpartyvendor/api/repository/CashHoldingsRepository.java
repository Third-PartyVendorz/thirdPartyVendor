package com.thirdpartyvendor.api.repository;

import java.util.Optional;
import java.util.List;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.thirdpartyvendor.api.entity.CashHolding;

public interface CashHoldingsRepository extends JpaRepository<CashHolding, Long> {
    List<CashHolding> findByUserId(Long userId);
    Optional<CashHolding> findByUserIdAndCurrencyCode(Long userId, String currencyCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT cashHolding FROM CashHolding cashHolding WHERE cashHolding.userId = :userId AND cashHolding.currencyCode = :currencyCode")
    Optional<CashHolding> findByUserIdAndCurrencyCodeForUpdate(
        @Param("userId") Long userId,
        @Param("currencyCode") String currencyCode
    );
}

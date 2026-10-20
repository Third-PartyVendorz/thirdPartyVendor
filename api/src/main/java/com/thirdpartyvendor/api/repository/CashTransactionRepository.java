package com.thirdpartyvendor.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thirdpartyvendor.api.entity.CashTransaction;

public interface CashTransactionRepository extends JpaRepository<CashTransaction, Long> {
    List<CashTransaction> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
}

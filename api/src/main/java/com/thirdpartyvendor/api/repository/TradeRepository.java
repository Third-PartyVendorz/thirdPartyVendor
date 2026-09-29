package com.thirdpartyvendor.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thirdpartyvendor.api.entity.Trade;

public interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findByOrderId(Long orderId);
}

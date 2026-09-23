package com.thirdpartyvendor.api.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.thirdpartyvendor.api.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByUserIdAndStatus(Long userId, Order.OrderStatus status);
}
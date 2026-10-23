package com.thirdpartyvendor.api.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.thirdpartyvendor.api.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :orderId")
    Optional<Order> findByIdForUpdate(@Param("orderId") Long orderId);

    List<Order> findByUserId(Long userId);
    List<Order> findByUserIdAndStatus(Long userId, Order.OrderStatus status);
    List<Order> findByStatus(Order.OrderStatus status);

    @Query("""
        SELECT o.ticker AS ticker, COUNT(o) AS orderCount
        FROM Order o
        WHERE o.status <> :excludedStatus AND o.createdAt BETWEEN :from AND :to
        GROUP BY o.ticker
        ORDER BY COUNT(o) DESC, o.ticker ASC
        """)
    List<TickerOrderCount> findTickerOrderCounts(
        @Param("excludedStatus") Order.OrderStatus excludedStatus,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    interface TickerOrderCount {
        String getTicker();
        Long getOrderCount();
    }
}
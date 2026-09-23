package com.thirdpartyvendor.api.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter 
@NoArgsConstructor 
@Entity 
@Table(name = "orders")
public class Order {
    
    public enum OrderIntent {
        BUY,
        SELL
    }

    public enum OrderStatus {
        PENDING,
        EXECUTED,
        CANCELLED
    }

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(name = "order_intent", nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderIntent orderIntent;

    @Column(name = "quantity", precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(name = "order_price", precision = 15, scale = 4)
    private BigDecimal orderPrice;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "order_currency", nullable = false)
    private String orderCurrency;

    @PrePersist()
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = OrderStatus.PENDING;
        }
    }
}

package com.thirdpartyvendor.api.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "trade")
public class Trade {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trade_id")
    private Long tradeId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "execution_price", nullable = false, precision = 15, scale = 4)
    private BigDecimal executionPrice;

    @Column(name = "execution_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal executionQuantity;

    @Column(name = "trade_timestamp", nullable = false)
    private LocalDateTime tradeTimestamp;

    @Column(name = "trade_currecny")
    private String tradeCurrency;

    @PrePersist
    void onCreate() {
        tradeTimestamp = LocalDateTime.now();
    }
}

package com.thirdpartyvendor.api.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.thirdpartyvendor.api.entity.Order.OrderStatus;

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
@Entity 
@NoArgsConstructor 
@Table(name = "exchange_log")
public class ForexLog {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exchange_id")
    private Long exchangeId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "from_currency", nullable = false)
    private String fromCurrency;

    @Column(name = "to_currency", nullable = false)
    private String toCurrency;

    @Column(name = "from_amount", nullable = false, precision = 20, scale = 6)
    private BigDecimal fromAmount;

    @Column(name = "to_amount", nullable = false, precision = 20, scale = 6)
    private BigDecimal toAmount;

    @Column(name = "exchange_rate", nullable = false, precision = 15, scale = 8)
    private BigDecimal exchangeRate;

    @Column(name = "exchange_timestamp", nullable = false)
    private LocalDateTime exchangeTimestamp;

    @PrePersist()
    void onCreate() {
        exchangeTimestamp = LocalDateTime.now();
    }
    
    
}

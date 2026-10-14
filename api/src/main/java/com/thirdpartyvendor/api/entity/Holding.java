package com.thirdpartyvendor.api.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter 
@Setter 
@NoArgsConstructor 
@Entity 
@Table(name = "holdings")
@IdClass(HoldingId.class)
public class Holding {
    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Id
    @Column(name = "ticker", nullable = false)
    private String ticker;

    @Column(name = "security", nullable = false)
    private String security;

    @Column(name = "asset_type", nullable = false)
    private String assetType;

    @Column(name = "num_shares", nullable = false, precision = 15, scale = 4)
    private BigDecimal numShares;
}

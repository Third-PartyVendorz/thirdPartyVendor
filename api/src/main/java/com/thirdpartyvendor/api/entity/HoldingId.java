package com.thirdpartyvendor.api.entity;

import java.io.Serializable;
import java.util.Objects;

public class HoldingId implements Serializable {

    private String ticker;
    private Long userId;

    public HoldingId() {

    }

    public HoldingId(String ticker, Long userId) {
        this.ticker = ticker;
        this.userId = userId;
    }

    public String getTicker() {
        return this.ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override 
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        HoldingId holdingId = (HoldingId) o;
        return Objects.equals(ticker, holdingId.ticker)
            && Objects.equals(userId, holdingId.userId);
    }

    @Override 
    public int hashCode() {
        return Objects.hash(ticker, userId);
    }
}
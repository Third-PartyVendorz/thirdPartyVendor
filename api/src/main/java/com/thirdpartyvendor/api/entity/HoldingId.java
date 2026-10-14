package com.thirdpartyvendor.api.entity;

import java.io.Serializable;
import java.util.Objects;

public class HoldingId implements Serializable {

    private Long assetId;
    private Long userId;

    public HoldingId() {

    }

    public HoldingId(Long assetId, Long userId) {
        this.assetId = assetId;
        this.userId = userId;
    }

    public Long getAssetId() {
        return this.assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
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
        return Objects.equals(assetId, holdingId.assetId)
            && Objects.equals(userId, holdingId.userId);
    }

    @Override 
    public int hashCode() {
        return Objects.hash(assetId, userId);
    }
}
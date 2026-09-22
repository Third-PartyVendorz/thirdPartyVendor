package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;
import com.thirdpartyvendor.api.entity.Order.OrderIntent;

public class CreateOrderRequest {
    private Long assetId;
    private OrderIntent orderIntent;
    private BigDecimal quantity;
    private BigDecimal orderPrice;

    public Long getAssetId() {
        return this.assetId;
    }
    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public OrderIntent getOrderIntent() {
        return this.orderIntent;
    }
    public void setOrderIntent(OrderIntent orderIntent) {
        this.orderIntent = orderIntent;
    }

    public BigDecimal getQuantity() {
        return this.quantity;
    }
    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getOrderPrice() {
        return this.orderPrice;
    }
    public void setOrderPrice(BigDecimal orderPrice) {
        this.orderPrice = orderPrice;
    }
}

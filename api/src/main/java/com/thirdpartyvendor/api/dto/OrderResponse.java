package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Order.OrderIntent;
import com.thirdpartyvendor.api.entity.Order.OrderStatus;

public class OrderResponse {
    private Long orderId;
    private Long userId;
    private Long assetId;
    private OrderIntent orderIntent;
    private BigDecimal quantity;
    private BigDecimal orderPrice;
    private OrderStatus status;
    private LocalDateTime createdAt;

    public OrderResponse(Order order) {
        this.orderId = order.getId();
        this.userId = order.getUserId();
        this.assetId = order.getAssetId();
        this.orderIntent = order.getOrderIntent();
        this.quantity = order.getQuantity();
        this.orderPrice = order.getOrderPrice();
        this.status = order.getStatus();
        this.createdAt = order.getCreatedAt();
    }

    public Long getOrderId() { return orderId; }
    public Long getUserId() { return userId;}
    public Long getAssetId() { return assetId; }
    public OrderIntent getOrderIntent() { return orderIntent; }
    public BigDecimal getQuantity() { return quantity; }
    public BigDecimal getOrderPrice() { return orderPrice; }
    public OrderStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

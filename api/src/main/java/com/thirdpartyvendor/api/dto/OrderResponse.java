package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Order.OrderIntent;
import com.thirdpartyvendor.api.entity.Order.OrderStatus;

public record OrderResponse(
    Long orderId,
    Long userId,
    Long assetId,
    OrderIntent orderIntent,
    BigDecimal quantity,
    BigDecimal orderPrice,
    OrderStatus status,
    LocalDateTime createdAt
) {
    public OrderResponse(Order order) {
        this(
            order.getId(),
            order.getUserId(),
            order.getAssetId(),
            order.getOrderIntent(),
            order.getQuantity(),
            order.getOrderPrice(),
            order.getStatus(),
            order.getCreatedAt()
        );
    }
}

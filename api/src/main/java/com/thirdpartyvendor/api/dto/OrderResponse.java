package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    LocalDateTime createdAt,
    String orderCurrency
) {}

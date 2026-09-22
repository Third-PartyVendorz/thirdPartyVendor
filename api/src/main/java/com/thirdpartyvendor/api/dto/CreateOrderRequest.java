package com.thirdpartyvendor.api.dto;

import java.math.BigDecimal;
import com.thirdpartyvendor.api.entity.Order.OrderIntent;

public record CreateOrderRequest(
    Long assetId,
    OrderIntent orderIntent,
    BigDecimal quantity,
    BigDecimal orderPrice
) {}

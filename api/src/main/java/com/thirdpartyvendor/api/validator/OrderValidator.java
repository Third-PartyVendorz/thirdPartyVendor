package com.thirdpartyvendor.api.validator;

import java.math.BigDecimal;

import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.error.OrderExceptions.BadOrderException;

@Component
public class OrderValidator {

    public void validateCreateOrder(CreateOrderRequest request, Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(401), "Authenticated user is required");
        }

        if (request == null) {
            throw new BadOrderException("Order request is required");
        }

        if (request.assetId() == null) {
            throw new BadOrderException("Asset id is required");
        }

        if (request.ticker() == null || request.ticker().trim().isBlank()) {
            throw new BadOrderException("Ticker is required");
        }

        if (request.orderIntent() == null) {
            throw new BadOrderException("Order intent is required");
        }

        boolean hasQuantity = request.quantity() != null;
        boolean hasOrderPrice = request.orderPrice() != null;

        if (hasQuantity == hasOrderPrice) {
            throw new BadOrderException("Exactly one of quantity or order price must be provided");
        }

        if (hasQuantity && request.quantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadOrderException("Quantity must be greater than zero");
        }

        if (hasOrderPrice && request.orderPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadOrderException("Order price must be greater than zero");
        }

        if (request.orderCurrency() == null || request.orderCurrency().trim().isBlank()) {
            throw new BadOrderException("Order currency is required");
        }
    }
}
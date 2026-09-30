package com.thirdpartyvendor.api.validator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.error.OrderExceptions.BadOrderException;
import com.thirdpartyvendor.api.entity.Order.OrderIntent;

class OrderValidatorTest {

    private final OrderValidator orderValidator = new OrderValidator();

    @Test
    void rejectsMissingOrderRequestWith422() {
        BadOrderException exception = assertThrows(BadOrderException.class,
            () -> orderValidator.validateCreateOrder(null, 1L));

        assertEquals("Order request is required", exception.getMessage());
    }

    @Test
    void rejectsMissingAssetIdWith422() {
        BadOrderException exception = assertThrows(BadOrderException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                null,
                OrderIntent.BUY,
                new BigDecimal("10"),
                null,
                "USD"
            ), 1L));

        assertEquals("Asset id is required", exception.getMessage());
    }

    @Test
    void rejectsMissingOrderIntentWith422() {
        BadOrderException exception = assertThrows(BadOrderException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                1L,
                null,
                new BigDecimal("10"),
                null,
                "USD"
            ), 1L));

        assertEquals("Order intent is required", exception.getMessage());
    }

    @Test
    void rejectsProvidingBothQuantityAndOrderPriceWith422() {
        BadOrderException exception = assertThrows(BadOrderException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                1L,
                OrderIntent.BUY,
                new BigDecimal("10"),
                new BigDecimal("100"),
                "USD"
            ), 1L));

        assertEquals("Exactly one of quantity or order price must be provided", exception.getMessage());
    }

    @Test
    void rejectsNonPositiveQuantityWith422() {
        BadOrderException exception = assertThrows(BadOrderException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                1L,
                OrderIntent.BUY,
                BigDecimal.ZERO,
                null,
                "USD"
            ), 1L));

        assertEquals("Quantity must be greater than zero", exception.getMessage());
    }

    @Test
    void rejectsNonPositiveOrderPriceWith422() {
        BadOrderException exception = assertThrows(BadOrderException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                1L,
                OrderIntent.BUY,
                null,
                BigDecimal.ZERO,
                "USD"
            ), 1L));

        assertEquals("Order price must be greater than zero", exception.getMessage());
    }

    @Test
    void rejectsMissingCurrencyWith422() {
        BadOrderException exception = assertThrows(BadOrderException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                1L,
                OrderIntent.BUY,
                new BigDecimal("10"),
                null,
                ""
            ), 1L));

        assertEquals("Order currency is required", exception.getMessage());
    }
}
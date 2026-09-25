package com.thirdpartyvendor.api.validator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.CreateOrderRequest;
import com.thirdpartyvendor.api.entity.Order.OrderIntent;

class OrderValidatorTest {

    private final OrderValidator orderValidator = new OrderValidator();

    @Test
    void rejectsMissingOrderRequestWith422() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> orderValidator.validateCreateOrder(null, 1L));

        assertEquals(HttpStatusCode.valueOf(422), exception.getStatusCode());
    }

    @Test
    void rejectsMissingAssetIdWith422() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                null,
                OrderIntent.BUY,
                new BigDecimal("10"),
                null,
                "USD"
            ), 1L));

        assertEquals(HttpStatusCode.valueOf(422), exception.getStatusCode());
    }

    @Test
    void rejectsMissingOrderIntentWith422() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                1L,
                null,
                new BigDecimal("10"),
                null,
                "USD"
            ), 1L));

        assertEquals(HttpStatusCode.valueOf(422), exception.getStatusCode());
    }

    @Test
    void rejectsProvidingBothQuantityAndOrderPriceWith422() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                1L,
                OrderIntent.BUY,
                new BigDecimal("10"),
                new BigDecimal("100"),
                "USD"
            ), 1L));

        assertEquals(HttpStatusCode.valueOf(422), exception.getStatusCode());
    }

    @Test
    void rejectsNonPositiveQuantityWith422() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                1L,
                OrderIntent.BUY,
                BigDecimal.ZERO,
                null,
                "USD"
            ), 1L));

        assertEquals(HttpStatusCode.valueOf(422), exception.getStatusCode());
    }

    @Test
    void rejectsNonPositiveOrderPriceWith422() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                1L,
                OrderIntent.BUY,
                null,
                BigDecimal.ZERO,
                "USD"
            ), 1L));

        assertEquals(HttpStatusCode.valueOf(422), exception.getStatusCode());
    }

    @Test
    void rejectsMissingCurrencyWith422() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> orderValidator.validateCreateOrder(new CreateOrderRequest(
                1L,
                OrderIntent.BUY,
                new BigDecimal("10"),
                null,
                ""
            ), 1L));

        assertEquals(HttpStatusCode.valueOf(422), exception.getStatusCode());
    }
}
ALTER TABLE cash_holdings
    ADD COLUMN buying_power NUMERIC(20, 6);

UPDATE cash_holdings cash
SET buying_power = cash.balance - COALESCE((
    SELECT SUM(
        CASE
            WHEN orders.quantity IS NOT NULL
                THEN orders.quantity * COALESCE(orders.instrument_price_at_order, 0)
            ELSE COALESCE(orders.order_price, 0)
        END
    )
    FROM orders
    WHERE orders.user_id = cash.user_id
      AND orders.order_currency = cash.currency_code
      AND orders.order_intent = 'BUY'
      AND orders.status = 'PENDING'
), 0);

ALTER TABLE cash_holdings
    ALTER COLUMN buying_power SET DEFAULT 0,
    ALTER COLUMN buying_power SET NOT NULL;
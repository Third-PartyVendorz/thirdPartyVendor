ALTER TABLE cash_holdings
    ADD COLUMN buying_power NUMERIC(20, 6);

UPDATE cash_holdings
SET buying_power = balance;

ALTER TABLE cash_holdings
    ALTER COLUMN buying_power SET DEFAULT 0,
    ALTER COLUMN buying_power SET NOT NULL;

ALTER TABLE orders
    ADD COLUMN reserved_cash NUMERIC(20, 6);
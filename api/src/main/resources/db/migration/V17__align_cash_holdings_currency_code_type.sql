ALTER TABLE cash_holdings
    ALTER COLUMN currency_code TYPE VARCHAR(3) USING currency_code::VARCHAR(3);
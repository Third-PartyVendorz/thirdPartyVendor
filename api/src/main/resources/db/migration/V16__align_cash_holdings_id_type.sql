ALTER TABLE cash_holdings
    ALTER COLUMN cash_id TYPE BIGINT USING cash_id::BIGINT;
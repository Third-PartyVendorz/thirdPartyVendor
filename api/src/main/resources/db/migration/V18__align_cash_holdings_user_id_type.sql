ALTER TABLE cash_holdings DROP CONSTRAINT IF EXISTS cash_holdings_user_id_fkey;

ALTER TABLE cash_holdings
    ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

ALTER TABLE cash_holdings
    ADD CONSTRAINT cash_holdings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
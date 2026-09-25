ALTER TABLE exchange_log DROP CONSTRAINT IF EXISTS exchange_log_user_id_fkey;

ALTER TABLE exchange_log
    ALTER COLUMN exchange_id TYPE BIGINT USING exchange_id::BIGINT,
    ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT,
    ALTER COLUMN from_currency TYPE VARCHAR(3) USING from_currency::VARCHAR(3),
    ALTER COLUMN to_currency TYPE VARCHAR(3) USING to_currency::VARCHAR(3);

ALTER TABLE exchange_log
    ADD CONSTRAINT exchange_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE holdings DROP CONSTRAINT IF EXISTS holdings_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE users
    ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

ALTER TABLE holdings
    ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

ALTER TABLE orders
    ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

ALTER TABLE holdings
    ADD CONSTRAINT holdings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
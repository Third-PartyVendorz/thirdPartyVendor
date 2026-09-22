ALTER TABLE trade DROP CONSTRAINT IF EXISTS trade_order_id_fkey;

ALTER TABLE orders
    ALTER COLUMN order_id TYPE BIGINT USING order_id::BIGINT;

ALTER TABLE trade
    ALTER COLUMN order_id TYPE BIGINT USING order_id::BIGINT;

ALTER TABLE trade
    ADD CONSTRAINT trade_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE;

ALTER TABLE holdings
    ALTER COLUMN asset_id TYPE BIGINT USING asset_id::BIGINT;

ALTER TABLE orders
    ALTER COLUMN asset_id TYPE BIGINT USING asset_id::BIGINT;

ALTER TABLE trade
    ALTER COLUMN trade_id TYPE BIGINT USING trade_id::BIGINT;
UPDATE orders o
SET ticker = h.ticker
FROM holdings h
WHERE o.asset_id = h.asset_id;

ALTER TABLE orders
ALTER COLUMN ticker SET NOT NULL;

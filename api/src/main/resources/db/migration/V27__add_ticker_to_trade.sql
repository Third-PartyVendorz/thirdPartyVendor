ALTER TABLE trade
ADD COLUMN ticker VARCHAR(10);

UPDATE trade t
SET ticker = o.ticker
FROM orders o
WHERE t.order_id = o.order_id;

ALTER TABLE trade
ALTER COLUMN ticker SET NOT NULL;
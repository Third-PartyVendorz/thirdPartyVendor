ALTER TABLE trade
ADD COLUMN ticker VARCHAR(10);

UPDATE trade t
SET ticker = s.ticker
FROM stock s
WHERE t.stock_id = s.id;

Alter TABLE trade
ALTER COLUMN ticker SET NOT NULL;
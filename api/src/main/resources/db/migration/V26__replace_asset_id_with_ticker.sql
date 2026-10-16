ALTER TABLE holdings
    DROP CONSTRAINT holdings_pkey;

ALTER TABLE holdings
    ADD CONSTRAINT holdings_pkey PRIMARY KEY (ticker, user_id);

ALTER TABLE holdings
    DROP COLUMN asset_id;

ALTER TABLE orders
    DROP COLUMN asset_id;
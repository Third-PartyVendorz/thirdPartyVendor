CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    -- enum
    order_intent VARCHAR(10) NOT NULL,
    -- either quantity or order_price must be provided based on if user chooses shares or dollar amount.
    quantity NUMERIC(15, 4),
    order_price NUMERIC(15, 4),
    instrument_price_at_order NUMERIC(15, 4),
    -- enum
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_currency VARCHAR(3),
    ticker VARCHAR(10) NOT NULL
);

CREATE TABLE trade (
    trade_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    execution_price NUMERIC(15, 4) NOT NULL,
    execution_quantity NUMERIC(15, 4) NOT NULL,
    trade_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trade_currency VARCHAR(3),
    ticker VARCHAR(10) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE INDEX idx_trade_timestamp
ON trade (trade_timestamp);

CREATE INDEX idx_trade_order_id
ON trade (order_id);
-- PostgreSQL schema consolidated from Flyway migrations V1 through V37.
-- Run against an empty database. Sample data and Flyway history are not included.
-- For standalone use, disable Flyway in the application's deployment configuration.
-- On AWS RDS PostgreSQL, publication use requires logical replication to be enabled
-- and sufficient database privileges. Omit CREATE PUBLICATION if not using replication.

BEGIN;

CREATE SEQUENCE users_user_id_seq AS INTEGER;
CREATE SEQUENCE orders_order_id_seq AS INTEGER;
CREATE SEQUENCE trade_trade_id_seq AS INTEGER;
CREATE SEQUENCE cash_holdings_cash_id_seq AS INTEGER;
CREATE SEQUENCE exchange_log_exchange_id_seq AS INTEGER;
CREATE SEQUENCE refresh_token_id_seq AS BIGINT;
CREATE SEQUENCE cash_transactions_transaction_id_seq AS BIGINT;

CREATE TABLE users (
    user_id BIGINT NOT NULL DEFAULT nextval('users_user_id_seq') PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    date_of_birth DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_frozen BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE holdings (
    security VARCHAR(255) NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    num_shares NUMERIC(15, 4) NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (ticker, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE orders (
    order_id BIGINT NOT NULL DEFAULT nextval('orders_order_id_seq') PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_intent VARCHAR(10) NOT NULL,
    quantity NUMERIC(15, 4),
    order_price NUMERIC(15, 4),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_currency VARCHAR(3),
    ticker VARCHAR(10) NOT NULL,
    instrument_price_at_order NUMERIC(15, 4),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE trade (
    trade_id BIGINT NOT NULL DEFAULT nextval('trade_trade_id_seq') PRIMARY KEY,
    order_id BIGINT NOT NULL,
    execution_price NUMERIC(15, 4) NOT NULL,
    execution_quantity NUMERIC(15, 4) NOT NULL,
    trade_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trade_currency VARCHAR(3),
    ticker VARCHAR(10) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE TABLE cash_holdings (
    cash_id BIGINT NOT NULL DEFAULT nextval('cash_holdings_cash_id_seq') PRIMARY KEY,
    user_id BIGINT NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    balance NUMERIC(20, 6) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    buying_power NUMERIC(20, 6) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (user_id, currency_code)
);

CREATE TABLE exchange_log (
    exchange_id BIGINT NOT NULL DEFAULT nextval('exchange_log_exchange_id_seq') PRIMARY KEY,
    user_id BIGINT NOT NULL,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    from_amount NUMERIC(20, 6) NOT NULL,
    to_amount NUMERIC(20, 6) NOT NULL,
    exchange_rate NUMERIC(15, 8) NOT NULL,
    exchange_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE refresh_token (
    id BIGINT NOT NULL DEFAULT nextval('refresh_token_id_seq') PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE cash_transactions (
    transaction_id BIGINT NOT NULL DEFAULT nextval('cash_transactions_transaction_id_seq') PRIMARY KEY,
    user_id BIGINT NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL,
    amount NUMERIC(20, 6) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CHECK (transaction_type IN ('DEPOSIT', 'WITHDRAW')),
    CHECK (amount > 0)
);

CREATE INDEX idx_cash_transactions_user_created_at
    ON cash_transactions (user_id, created_at DESC);

CREATE TABLE watchlist (
    user_id BIGINT NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, ticker),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CHECK (ticker = UPPER(ticker)),
    CHECK (ticker <> '')
);

CREATE INDEX idx_watchlist_user_id
    ON watchlist (user_id);

ALTER SEQUENCE users_user_id_seq OWNED BY users.user_id;
ALTER SEQUENCE orders_order_id_seq OWNED BY orders.order_id;
ALTER SEQUENCE trade_trade_id_seq OWNED BY trade.trade_id;
ALTER SEQUENCE cash_holdings_cash_id_seq OWNED BY cash_holdings.cash_id;
ALTER SEQUENCE exchange_log_exchange_id_seq OWNED BY exchange_log.exchange_id;
ALTER SEQUENCE refresh_token_id_seq OWNED BY refresh_token.id;
ALTER SEQUENCE cash_transactions_transaction_id_seq OWNED BY cash_transactions.transaction_id;

CREATE VIEW holding_trade_details AS
SELECT
    o.user_id,
    o.order_id,
    t.trade_id,
    t.ticker,
    o.order_intent,
    t.execution_price,
    t.execution_quantity,
    t.execution_price * t.execution_quantity AS principal_amount,
    CASE
        WHEN o.order_intent = 'BUY'
            THEN t.execution_price * t.execution_quantity
        WHEN o.order_intent = 'SELL'
            THEN -(t.execution_price * t.execution_quantity)
    END AS signed_principal_amount,
    COALESCE(t.trade_currency, o.order_currency) AS trade_currency,
    t.trade_timestamp
FROM orders o
JOIN trade t ON t.order_id = o.order_id
WHERE o.status = 'EXECUTED';

CREATE PUBLICATION pub_tpvdb FOR TABLE orders, trade;

COMMIT;
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    date_of_birth DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE holdings (
    asset_id BIGINT,
    security VARCHAR(255) NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    num_shares NUMERIC(15, 4) NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (asset_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    user_id INT NOT NULL,
    asset_id BIGINT NOT NULL,
    order_intent VARCHAR(10) NOT NULL,
    quantity NUMERIC(15, 4),
    order_price NUMERIC(15, 4),
    order_currency VARCHAR(3),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE trade (
    trade_id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    execution_price NUMERIC(15, 4) NOT NULL,
    execution_quantity NUMERIC(15, 4) NOT NULL,
    trade_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trade_currency VARCHAR(3),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE TABLE cash_holdings (
    cash_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    balance NUMERIC(20, 6) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (user_id, currency_code)
);

CREATE TABLE exchange_log (
    exchange_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    from_amount NUMERIC(20, 6) NOT NULL,
    to_amount NUMERIC(20, 6) NOT NULL,
    exchange_rate NUMERIC(15, 8) NOT NULL,
    exchange_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);





CREATE TABLE cash_holdings (
    cash_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    currency_code CHAR(3) NOT NULL,
    balance NUMERIC(20, 6) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (user_id, currency_code)
);
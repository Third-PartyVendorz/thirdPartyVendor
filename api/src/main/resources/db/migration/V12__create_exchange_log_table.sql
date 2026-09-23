CREATE TABLE exchange_log (
    exchange_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    from_currency CHAR(3) NOT NULL,
    to_currency CHAR(3) NOT NULL,
    from_amount NUMERIC(20, 6) NOT NULL,
    to_amount NUMERIC(20, 6) NOT NULL,
    exchange_rate NUMERIC(15, 8) NOT NULL,
    exchange_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

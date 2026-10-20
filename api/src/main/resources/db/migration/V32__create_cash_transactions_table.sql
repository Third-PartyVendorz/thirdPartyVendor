CREATE TABLE cash_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    currency_code CHAR(3) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL,
    amount NUMERIC(20, 6) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CHECK (transaction_type IN ('DEPOSIT', 'WITHDRAW')),
    CHECK (amount > 0)
);

CREATE INDEX idx_cash_transactions_user_created_at
    ON cash_transactions (user_id, created_at DESC);

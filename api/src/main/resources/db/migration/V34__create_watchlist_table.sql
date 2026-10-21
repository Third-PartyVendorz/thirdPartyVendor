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
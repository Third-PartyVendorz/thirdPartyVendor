CREATE TABLE assets (
    asset_id SERIAL,
    security VARCHAR(255) NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    num_shares NUMERIC(15, 4) NOT NULL,
    user_id INT NOT NULL,
    -- Compound primary key
    PRIMARY KEY (asset_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

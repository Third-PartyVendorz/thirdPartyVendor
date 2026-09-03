CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    -- enum
    order_intent VARCHAR(10) NOT NULL,
    -- either quantity or order_price must be provided based on if user chooses shares or dollar amount.
    quantity NUMERIC(15, 4),
    order_price NUMERIC(15, 4),
    -- enum
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

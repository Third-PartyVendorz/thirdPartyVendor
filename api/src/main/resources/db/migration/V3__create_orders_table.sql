CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    order_intent VARCHAR(10) NOT NULL,
    quantity NUMERIC(15, 4) NOT NULL,
    order_price NUMERIC(15, 4) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id, user_id) REFERENCES assets(asset_id, user_id) ON DELETE CASCADE
);

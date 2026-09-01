CREATE TABLE trade (
    trade_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    execution_price NUMERIC(15, 4) NOT NULL,
    execution_quantity NUMERIC(15, 4) NOT NULL,
    trade_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

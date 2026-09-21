-- Seed data for users, holdings, orders, and trades

INSERT INTO users (user_id, first_name, last_name, email, password_hash, role, phone_number, date_of_birth) VALUES
    (1, 'Fredrick', 'Robert', 'frobert@frogpond.com', '$2b$12$KIXQeYqM8n1s7kZbT6RJ2eYQwGZ2p1lWc9k4X8dQ9vJ0F1yZQ2ZlO', 'user', '555-0101', '1990-05-15'),
    (2, 'Jane', 'Doe', 'jane.doe@example.com', '$2b$12$3fZQ1oT9nqzZ8vG7B5dO7uWn4yFhE5cQmX0yA2sR7pL6tK9uH1jSa', 'user', '555-0102', '1992-08-22'),
    (3, 'Admin', 'User', 'admin@brokerage.com', '$2b$12$Yq7fE0n2b1sT4rX9mP6cO.uJ3zK8dR5vL1wA0hN9qS2yG7xF4bC3e', 'admin', '555-0103', '1985-03-10');

INSERT INTO holdings (asset_id, security, ticker, asset_type, num_shares, user_id) VALUES
    (1, 'Apple Inc.', 'AAPL', 'equity', 10.0000, 1),
    (2, 'Bitcoin', 'BTC', 'crypto', 0.5000, 1),
    (3, 'Tesla Inc.', 'TSLA', 'equity', 5.0000, 2),
    (4, 'SPDR S&P 500 ETF Trust', 'SPY', 'etf', 20.0000, 3);

INSERT INTO orders (order_id, user_id, asset_id, order_intent, quantity, order_price, status) VALUES
    (1, 1, 1, 'BUY', 10.0000, 150.25, 'FILLED'),
    (2, 1, 2, 'BUY', 0.5000, 42000.00, 'FILLED'),
    (3, 2, 3, 'BUY', 5.0000, 250.00, 'PENDING'),
    (4, 3, 4, 'SELL', 20.0000, 430.10, 'FILLED');

INSERT INTO trade (trade_id, order_id, execution_price, execution_quantity) VALUES
    (1, 1, 150.30, 10.0000),
    (2, 2, 41950.00, 0.5000),
    (3, 4, 430.05, 20.0000);

-- First draft of schema

CREATE TABLE User (
    user_id SERIAL PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
--     Will need to apply password hashing encryption for security reasons
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE Assets (
    asset_id SERIAL PRIMARY KEY,
    security VARCHAR(255) NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    num_shares NUMERIC(15, 4) NOT NULL,
    user_id INT NOT NULL,
--     Compound primary key
    PRIMARY KEY (asset_id, user_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

CREATE TABLE Order (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    order_intent VARCHAR(10) NOT NULL,
    quantity NUMERIC(15, 4) NOT NULL,
    order_price NUMERIC(15, 4) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     May not need updated at but could be useful for tracking order status changes from this table
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES Assets(asset_id) ON DELETE CASCADE
);

-- Will likely need to clean this table up but for now should suffice:
-- Do we need to have quantity here? Do we need asset_id here? --> Can we pull right from order?
--
CREATE TABLE Trade (
    trade_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    execution_price NUMERIC(15, 4) NOT NULL,
    execution_quantity NUMERIC(15, 4) NOT NULL,
    trade_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Order(order_id) ON DELETE CASCADE
);


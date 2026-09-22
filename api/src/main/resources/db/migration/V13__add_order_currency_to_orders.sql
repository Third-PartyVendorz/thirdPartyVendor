-- Add order_currency to orders table to specify the currency of the order price

ALTER TABLE orders
ADD COLUMN order_currency VARCHAR(3);

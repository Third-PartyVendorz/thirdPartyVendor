SELECT setval(
    pg_get_serial_sequence('orders', 'order_id'),
    COALESCE((SELECT MAX(order_id) FROM orders), 1),
    true
);
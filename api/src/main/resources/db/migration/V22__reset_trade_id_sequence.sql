SELECT setval(
    pg_get_serial_sequence('trade', 'trade_id'),
    COALESCE((SELECT MAX(trade_id) FROM trade), 1),
    true
);

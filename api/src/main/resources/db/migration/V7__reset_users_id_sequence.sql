SELECT setval(
    pg_get_serial_sequence('users', 'user_id'),
    COALESCE((SELECT MAX(user_id) FROM users), 1),
    true
);
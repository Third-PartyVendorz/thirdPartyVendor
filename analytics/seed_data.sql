-- September 2026 market seed data.
-- Run after Flyway has applied V27 and the migration seed users (1, 2, 3) exist.
-- This script is additive and uses dedicated order/trade ID ranges so it can be rerun safely.

BEGIN;

-- Additional assets held by the existing migration-seeded users.
INSERT INTO holdings (security, ticker, asset_type, num_shares, user_id) VALUES
    ('NVIDIA Corporation', 'NVDA', 'equity', 42.0000, 1),
    ('Microsoft Corporation', 'MSFT', 'equity', 18.0000, 1),
    ('Ethereum', 'ETH', 'crypto', 3.2500, 1),
    ('Amazon.com, Inc.', 'AMZN', 'equity', 24.0000, 2),
    ('Alphabet Inc.', 'GOOGL', 'equity', 16.0000, 2),
    ('Invesco QQQ Trust', 'QQQ', 'etf', 30.0000, 2),
    ('SPDR Gold Shares', 'GLD', 'etf', 35.0000, 3),
    ('Meta Platforms, Inc.', 'META', 'equity', 12.0000, 3)
ON CONFLICT (ticker, user_id) DO NOTHING;

-- Currencies not already present in the migration seed, plus balances used by orders.
INSERT INTO cash_holdings (user_id, currency_code, balance, last_updated) VALUES
    (1, 'JPY', 2500000.000000, '2026-09-30 16:00:00'),
    (1, 'AUD', 18000.000000, '2026-09-30 16:00:00'),
    (2, 'EUR', 42000.000000, '2026-09-30 16:00:00'),
    (2, 'GBP', 19000.000000, '2026-09-30 16:00:00'),
    (3, 'CAD', 38000.000000, '2026-09-30 16:00:00'),
    (3, 'AUD', 26000.000000, '2026-09-30 16:00:00')
ON CONFLICT (user_id, currency_code) DO NOTHING;

-- Every order is executed, so each row below has one corresponding trade.
INSERT INTO orders
    (order_id, user_id, ticker, order_intent, quantity, order_price, status, created_at, order_currency)
VALUES
    (1001, 1, 'NVDA', 'BUY', 8.0000, 171.2500, 'EXECUTED', '2026-09-01 09:18:00', 'USD'),
    (1002, 2, 'AMZN', 'SELL', 5.0000, 231.8000, 'EXECUTED', '2026-09-02 10:42:00', 'EUR'),
    (1003, 3, 'GLD', 'BUY', 10.0000, 324.6000, 'EXECUTED', '2026-09-03 11:06:00', 'CAD'),
    (1004, 1, 'MSFT', 'SELL', 4.0000, 506.7500, 'EXECUTED', '2026-09-04 14:21:00', 'USD'),
    (1005, 2, 'GOOGL', 'BUY', 6.0000, 246.1500, 'EXECUTED', '2026-09-05 09:37:00', 'GBP'),
    (1006, 3, 'META', 'SELL', 3.0000, 744.3000, 'EXECUTED', '2026-09-06 13:12:00', 'AUD'),
    (1007, 1, 'ETH', 'BUY', 0.7500, 4385.0000, 'EXECUTED', '2026-09-07 15:44:00', 'USD'),
    (1008, 2, 'QQQ', 'SELL', 7.0000, 598.2000, 'EXECUTED', '2026-09-08 10:08:00', 'EUR'),
    (1009, 3, 'GLD', 'BUY', 6.0000, 326.1500, 'EXECUTED', '2026-09-09 12:29:00', 'CAD'),
    (1010, 1, 'NVDA', 'SELL', 12.0000, 176.4000, 'EXECUTED', '2026-09-10 09:51:00', 'JPY'),
    (1011, 2, 'AMZN', 'BUY', 9.0000, 233.7500, 'EXECUTED', '2026-09-11 11:16:00', 'GBP'),
    (1012, 3, 'META', 'SELL', 2.0000, 752.9000, 'EXECUTED', '2026-09-12 14:03:00', 'AUD'),
    (1013, 1, 'MSFT', 'BUY', 5.0000, 509.1000, 'EXECUTED', '2026-09-13 10:33:00', 'USD'),
    (1014, 2, 'GOOGL', 'SELL', 4.0000, 251.4500, 'EXECUTED', '2026-09-14 13:48:00', 'EUR'),
    (1015, 3, 'GLD', 'BUY', 8.0000, 329.8000, 'EXECUTED', '2026-09-15 09:24:00', 'CAD'),
    (1016, 1, 'ETH', 'SELL', 0.5000, 4520.0000, 'EXECUTED', '2026-09-16 15:02:00', 'USD'),
    (1017, 2, 'QQQ', 'BUY', 11.0000, 603.4500, 'EXECUTED', '2026-09-17 10:19:00', 'GBP'),
    (1018, 3, 'META', 'SELL', 4.0000, 761.2500, 'EXECUTED', '2026-09-18 12:41:00', 'AUD'),
    (1019, 1, 'NVDA', 'BUY', 7.0000, 181.9000, 'EXECUTED', '2026-09-19 09:46:00', 'JPY'),
    (1020, 2, 'AMZN', 'SELL', 6.0000, 239.6000, 'EXECUTED', '2026-09-20 14:27:00', 'EUR'),
    (1021, 3, 'GLD', 'BUY', 5.0000, 332.5000, 'EXECUTED', '2026-09-21 11:02:00', 'CAD'),
    (1022, 1, 'MSFT', 'SELL', 3.0000, 514.8500, 'EXECUTED', '2026-09-22 13:35:00', 'USD'),
    (1023, 2, 'GOOGL', 'BUY', 8.0000, 255.3000, 'EXECUTED', '2026-09-23 10:57:00', 'GBP'),
    (1024, 3, 'META', 'SELL', 1.0000, 775.4000, 'EXECUTED', '2026-09-24 15:18:00', 'AUD'),
    (1025, 1, 'ETH', 'BUY', 0.4000, 4610.0000, 'EXECUTED', '2026-09-25 09:11:00', 'USD'),
    (1026, 2, 'QQQ', 'SELL', 9.0000, 611.8500, 'EXECUTED', '2026-09-26 12:06:00', 'EUR'),
    (1027, 3, 'GLD', 'BUY', 7.0000, 335.2000, 'EXECUTED', '2026-09-27 10:26:00', 'CAD'),
    (1028, 1, 'NVDA', 'SELL', 10.0000, 188.7500, 'EXECUTED', '2026-09-28 14:44:00', 'JPY'),
    (1029, 2, 'AMZN', 'BUY', 4.0000, 244.9000, 'EXECUTED', '2026-09-29 11:39:00', 'GBP'),
    (1030, 3, 'META', 'SELL', 2.0000, 789.1000, 'EXECUTED', '2026-09-30 15:07:00', 'AUD')
ON CONFLICT (order_id) DO NOTHING;

INSERT INTO trade
    (trade_id, order_id, ticker, execution_price, execution_quantity, trade_timestamp, trade_currency)
VALUES
    (2001, 1001, 'NVDA', 171.4200, 8.0000, '2026-09-01 09:19:12', 'USD'),
    (2002, 1002, 'AMZN', 231.5500, 5.0000, '2026-09-02 10:42:36', 'EUR'),
    (2003, 1003, 'GLD', 324.7200, 10.0000, '2026-09-03 11:06:41', 'CAD'),
    (2004, 1004, 'MSFT', 506.5800, 4.0000, '2026-09-04 14:21:23', 'USD'),
    (2005, 1005, 'GOOGL', 246.3100, 6.0000, '2026-09-05 09:37:18', 'GBP'),
    (2006, 1006, 'META', 744.0500, 3.0000, '2026-09-06 13:12:55', 'AUD'),
    (2007, 1007, 'ETH', 4388.5000, 0.7500, '2026-09-07 15:44:09', 'USD'),
    (2008, 1008, 'QQQ', 598.0500, 7.0000, '2026-09-08 10:08:42', 'EUR'),
    (2009, 1009, 'GLD', 326.2800, 6.0000, '2026-09-09 12:29:14', 'CAD'),
    (2010, 1010, 'NVDA', 176.5500, 12.0000, '2026-09-10 09:51:37', 'JPY'),
    (2011, 1011, 'AMZN', 233.9200, 9.0000, '2026-09-11 11:16:26', 'GBP'),
    (2012, 1012, 'META', 752.7000, 2.0000, '2026-09-12 14:03:48', 'AUD'),
    (2013, 1013, 'MSFT', 509.2800, 5.0000, '2026-09-13 10:33:17', 'USD'),
    (2014, 1014, 'GOOGL', 251.2200, 4.0000, '2026-09-14 13:48:31', 'EUR'),
    (2015, 1015, 'GLD', 329.9500, 8.0000, '2026-09-15 09:24:52', 'CAD'),
    (2016, 1016, 'ETH', 4517.0000, 0.5000, '2026-09-16 15:02:44', 'USD'),
    (2017, 1017, 'QQQ', 603.6800, 11.0000, '2026-09-17 10:19:27', 'GBP'),
    (2018, 1018, 'META', 761.0500, 4.0000, '2026-09-18 12:41:16', 'AUD'),
    (2019, 1019, 'NVDA', 182.0500, 7.0000, '2026-09-19 09:46:33', 'JPY'),
    (2020, 1020, 'AMZN', 239.4200, 6.0000, '2026-09-20 14:27:08', 'EUR'),
    (2021, 1021, 'GLD', 332.6800, 5.0000, '2026-09-21 11:02:45', 'CAD'),
    (2022, 1022, 'MSFT', 515.0200, 3.0000, '2026-09-22 13:35:22', 'USD'),
    (2023, 1023, 'GOOGL', 255.4800, 8.0000, '2026-09-23 10:57:39', 'GBP'),
    (2024, 1024, 'META', 775.1500, 1.0000, '2026-09-24 15:18:51', 'AUD'),
    (2025, 1025, 'ETH', 4613.0000, 0.4000, '2026-09-25 09:11:29', 'USD'),
    (2026, 1026, 'QQQ', 612.1000, 9.0000, '2026-09-26 12:06:17', 'EUR'),
    (2027, 1027, 'GLD', 335.0500, 7.0000, '2026-09-27 10:26:46', 'CAD'),
    (2028, 1028, 'NVDA', 188.9200, 10.0000, '2026-09-28 14:44:35', 'JPY'),
    (2029, 1029, 'AMZN', 245.1800, 4.0000, '2026-09-29 11:39:03', 'GBP'),
    (2030, 1030, 'META', 788.8500, 2.0000, '2026-09-30 15:07:28', 'AUD')
ON CONFLICT (trade_id) DO NOTHING;

-- Supporting FX activity for the same reporting period.
INSERT INTO exchange_log
    (user_id, from_currency, to_currency, from_amount, to_amount, exchange_rate, exchange_timestamp)
VALUES
    (1, 'USD', 'JPY', 5000.000000, 745000.000000, 149.00000000, '2026-09-01 08:30:00'),
    (2, 'EUR', 'GBP', 8000.000000, 6840.000000, 0.85500000, '2026-09-05 08:45:00'),
    (3, 'CAD', 'USD', 12000.000000, 8700.000000, 0.72500000, '2026-09-10 09:05:00'),
    (1, 'USD', 'AUD', 6500.000000, 9800.000000, 1.50769231, '2026-09-15 08:55:00'),
    (2, 'GBP', 'EUR', 4200.000000, 4920.000000, 1.17142857, '2026-09-20 09:20:00'),
    (3, 'AUD', 'CAD', 7000.000000, 6125.000000, 0.87500000, '2026-09-25 08:40:00')
;

-- Keep identity-generated IDs above the explicit seed ranges.
SELECT setval(pg_get_serial_sequence('orders', 'order_id'), GREATEST(COALESCE((SELECT MAX(order_id) FROM orders), 1), 1030), true);
SELECT setval(pg_get_serial_sequence('trade', 'trade_id'), GREATEST(COALESCE((SELECT MAX(trade_id) FROM trade), 1), 2030), true);
SELECT setval(pg_get_serial_sequence('cash_holdings', 'cash_id'), COALESCE((SELECT MAX(cash_id) FROM cash_holdings), 1), true);
SELECT setval(pg_get_serial_sequence('exchange_log', 'exchange_id'), COALESCE((SELECT MAX(exchange_id) FROM exchange_log), 1), true);

COMMIT;
CREATE VIEW holding_trade_details AS
SELECT
    o.user_id,
    o.order_id,
    t.trade_id,
    t.ticker,
    o.order_intent,
    t.execution_price,
    t.execution_quantity,
    t.execution_price * t.execution_quantity AS principal_amount,
    CASE
        WHEN o.order_intent = 'BUY'
            THEN t.execution_price * t.execution_quantity
        WHEN o.order_intent = 'SELL'
            THEN -(t.execution_price * t.execution_quantity)
    END AS signed_principal_amount,
    COALESCE(t.trade_currency, o.order_currency) AS trade_currency,
    t.trade_timestamp
FROM orders o
JOIN trade t ON t.order_id = o.order_id
WHERE o.status = 'EXECUTED';

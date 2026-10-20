from datetime import datetime

def get_date_tag():
    now = datetime.now()
    return now.month, now.year, f"{now.year}_{now.month:02d}"
    
def get_current_month_trades_query():
    month, year, _ = get_date_tag()
    month_start = datetime(year, month, 1)
    if month == 12:
        next_month_start = datetime(year + 1, 1, 1)
    else:
        next_month_start = datetime(year, month + 1, 1)

    query = """
    SELECT o.order_intent,
           t.execution_quantity,
           t.execution_price,
           o.ticker,
           t.trade_timestamp
    FROM trade AS t
    JOIN orders AS o ON t.order_id = o.order_id
    WHERE t.trade_timestamp >= %s
      AND t.trade_timestamp < %s;
    """
    return query, (month_start, next_month_start)
    
def get_custom_date_trades_query(start_date, end_date):
    start_date = datetime.fromisoformat(start_date)
    end_date = datetime.fromisoformat(end_date)
    
    query = """
    SELECT o.order_intent,
           t.execution_quantity,
           t.execution_price,
           o.ticker,
           t.trade_timestamp
    FROM trade AS t
    JOIN orders AS o ON t.order_id = o.order_id
    WHERE t.trade_timestamp >= %s
      AND t.trade_timestamp < %s;
    """
    return query, (start_date, end_date)
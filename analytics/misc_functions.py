from datetime import datetime

def get_date_tag():
    now = datetime.now()
    return now.month, now.year, f"{now.year}_{now.month:02d}"

def get_previous_month_trades_query():
    month, year, date_tag = get_date_tag()
    if month == 1:
        month = 12
        year -= 1
    else:
        month -= 1
        
    return f"""
    WITH filtered_trades AS (
        SELECT t.*
        FROM trade t
        WHERE EXTRACT(YEAR FROM t.trade_timestamp) = {year} 
        AND EXTRACT(MONTH FROM t.trade_timestamp) = {month}
    )
    SELECT ft.*, o.*, h.*
    FROM filtered_trades ft
    JOIN orders o ON ft.order_id = o.order_id
    JOIN holdings h ON o.user_id = h.user_id AND o.asset_id = h.asset_id;
    """
    
def get_current_month_trades_query():
    month, year, date_tag = get_date_tag()
    
    return f"""
    WITH filtered_trades AS (
        SELECT t.*
        FROM trade t
        WHERE EXTRACT(YEAR FROM t.trade_timestamp) = {year} 
        AND EXTRACT(MONTH FROM t.trade_timestamp) = {month}
    )
    SELECT ft.*, o.*, h.*
    FROM filtered_trades ft
    JOIN orders o ON ft.order_id = o.order_id
    JOIN holdings h ON o.user_id = h.user_id AND o.asset_id = h.asset_id;
    """
    


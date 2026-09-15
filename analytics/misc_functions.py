from datetime import datetime

def get_previous_month_trades_query():
    now = datetime.now()
    month = now.month 
    year = now.year
    # print(month)
    # print(year)
    # if month == 1:
    #     month = 12
    #     year -= 1
    # else:
    #     month -= 1
    # return f"""
    # SELECT * FROM trade
    # WHERE EXTRACT(YEAR FROM trade_timestamp) = {year} AND EXTRACT(MONTH FROM trade_timestamp) = {month};
    # """
    
    # return f"""
    # WITH filtered_trades AS (
    #     SELECT t.*
    #     FROM trade t
    #     WHERE EXTRACT(YEAR FROM t.trade_timestamp) = {year} 
    #     AND EXTRACT(MONTH FROM t.trade_timestamp) = {month}
    # )
    # SELECT ft.*, o.*
    # FROM filtered_trades ft
    # JOIN orders o ON ft.order_id = o.order_id;
    # """
    
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
    


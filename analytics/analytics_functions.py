import pandas as pd
import numpy as np

# ===== Importing and Validation =====

def json_to_dataframe(json_data):
    return pd.DataFrame(json_data)

def validate_dataframe(df):
    """Validate that dataframe has data and required columns."""
    if df is None or df.empty:
        raise ValueError("DataFrame is empty or None")
    required_columns = ['order_intent', 'execution_quantity', 'trade_timestamp', 'ticker']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
    return True
# =================================


# ========== Buy/Sell Analysis - Count and Volume ==========

def buy_sell_count(df):
    """Calculate buy and sell counts with error handling."""
    validate_dataframe(df)
    buy_count = int(df[df['order_intent'] == 'BUY'].shape[0])
    sell_count = int(df[df['order_intent'] == 'SELL'].shape[0])
        
    if buy_count == 0 and sell_count == 0:
        raise ValueError("No buy or sell orders found in data")
        
    return buy_count, sell_count


def buy_sell_volume(df):
    """Calculate buy and sell volumes with error handling."""
            
    if 'execution_quantity' not in df.columns:
        raise KeyError("'execution_quantity' column not found in DataFrame")
        
    buy_volume = float(df[df['order_intent'] == 'BUY']['execution_quantity'].sum())
    sell_volume = float(df[df['order_intent'] == 'SELL']['execution_quantity'].sum())
        
    if buy_volume < 0 or sell_volume < 0:
        raise ValueError("Volumes cannot be negative")
        
    if buy_volume == 0 and sell_volume == 0:
        raise ValueError("No volume data found")
        
    return buy_volume, sell_volume
# ============================================================


# ===== Trade Volume by Day of the Month - Buy and Sell =====

def trade_volume_by_date(df):
    """Calculate trade volume by day of month with error handling."""
        
    if 'trade_timestamp' not in df.columns:
        raise KeyError("'trade_timestamp' column not found")
        
    # Parse timestamps without modifying the original dataframe
    timestamps = pd.to_datetime(df['trade_timestamp'], errors='coerce')
        
    if timestamps.isna().all():
        raise ValueError("Could not parse any timestamps")
        
    # Extract day of the month and convert to string for JSON serialization
    day_of_month = timestamps.dt.date.astype(str)
        
    trade_volume_by_day = df.groupby(day_of_month)['execution_quantity'].sum()

    trade_volume_by_day_and_side = df.groupby([day_of_month, 'order_intent'])['execution_quantity'].sum()
        
    if trade_volume_by_day.empty or trade_volume_by_day.sum() == 0:
        raise ValueError("No volume data found by day of month")
    
    # Restructure trade_volume_by_day_and_side to have sides as top-level keys
    trade_volume_by_day_and_side_dict = {}
    for (date, side), volume in trade_volume_by_day_and_side.items():
        if side not in trade_volume_by_day_and_side_dict:
            trade_volume_by_day_and_side_dict[side] = {}
        trade_volume_by_day_and_side_dict[side][date] = volume
        
    return trade_volume_by_day.to_dict(), trade_volume_by_day_and_side_dict
# ============================================================


# ===== Trade Volume by Market Hour - Market Hours vs After Market Hours====

def trade_volume_by_market_hour(df):
    """Calculate trade volume by market hour with fixed 30-minute intervals.
    
    Creates 14 buckets:
    - 13 buckets for market hours (9:30am - 4:00pm in 30-minute intervals)
    - 1 bucket for after-hours/pre-market trading
    """
    if 'trade_timestamp' not in df.columns:
        raise KeyError("'trade_timestamp' column not found")
        
    # Parse timestamps without modifying the original dataframe
    timestamps = pd.to_datetime(df['trade_timestamp'], errors='coerce')
        
    if timestamps.isna().all():
        raise ValueError("Could not parse any timestamps")
        
    # Calculate total minutes since midnight for each timestamp
    total_minutes = timestamps.dt.hour * 60 + timestamps.dt.minute
        
    # Define fixed market hour intervals (in minutes since midnight)
    # 13 intervals: 570-600, 600-630, ..., 930-960 (9:30am to 4:00pm)
    market_intervals = [
        (570, 600),    # 1: 9:30am - 10:00am
        (600, 630),    # 2: 10:00am - 10:30am
        (630, 660),    # 3: 10:30am - 11:00am
        (660, 690),    # 4: 11:00am - 11:30am
        (690, 720),    # 5: 11:30am - 12:00pm
        (720, 750),    # 6: 12:00pm - 12:30pm
        (750, 780),    # 7: 12:30pm - 1:00pm
        (780, 810),    # 8: 1:00pm - 1:30pm
        (810, 840),    # 9: 1:30pm - 2:00pm
        (840, 870),    # 10: 2:00pm - 2:30pm
        (870, 900),    # 11: 2:30pm - 3:00pm
        (900, 930),    # 12: 3:00pm - 3:30pm
        (930, 960),    # 13: 3:30pm - 4:00pm
    ]
        
    def assign_interval(minutes):
        for idx, (start, end) in enumerate(market_intervals, 1):
            if start <= minutes < end:
                return idx
        return 14  
        
    df_with_intervals = df.copy()
    df_with_intervals['interval'] = total_minutes.apply(assign_interval)
        
    volume_by_interval = df_with_intervals.groupby('interval')['execution_quantity'].sum()
        
    volume_by_interval = volume_by_interval.reindex(range(1, 15), fill_value=0)
        
    volume_by_interval_and_side = df_with_intervals.groupby(['interval', 'order_intent'])['execution_quantity'].sum()
        
    if volume_by_interval.sum() == 0:
        raise ValueError("No volume data found by market hour")
    
    # Restructure volume_by_interval_and_side to have sides as top-level keys
    volume_by_interval_and_side_dict = {}
    for (interval, side), volume in volume_by_interval_and_side.items():
        if side not in volume_by_interval_and_side_dict:
            volume_by_interval_and_side_dict[side] = {}
        volume_by_interval_and_side_dict[side][interval] = volume
        
    total_market_volume = volume_by_interval.iloc[:13].sum()
    total_after_hours_volume = volume_by_interval.iloc[13]  # Index 13 is interval 14
        
    return volume_by_interval.to_dict(), volume_by_interval_and_side_dict, total_market_volume, total_after_hours_volume
# ================================================================   


# ===== K Most Traded Assets =====
def k_most_traded_assets(df, k=5):
    """Get the k most traded assets by volume."""      
    if 'ticker' not in df.columns:
        raise KeyError("'ticker' column not found")
        
    asset_volumes = df.groupby('ticker')['execution_quantity'].sum().sort_values(ascending=False)
        
    if asset_volumes.empty:
        raise ValueError("No asset data found")
        
    top_k_assets = asset_volumes.head(k).to_dict()
        
    if not top_k_assets:
        raise ValueError(f"Could not find {k} assets in data")
        
    return top_k_assets
# ================================================================


# ===== Main analytics function =====
def perform_analytics(df, k=5):
    """Perform all analytics with comprehensive error handling."""
    formatted_payload = {}
    
    try:
        # Validate input data
        validate_dataframe(df)
        
        # Metric 1: Buy/Sell Count
        try:
            buy_count, sell_count = buy_sell_count(df)
            formatted_payload["buy_count"] = buy_count
            formatted_payload["sell_count"] = sell_count
        except Exception as e:
            print(f"Warning: Failed to calculate buy/sell count: {str(e)}")
            formatted_payload["buy_count"] = 0
            formatted_payload["sell_count"] = 0
        
        # Metric 2: Buy/Sell Volume
        try:
            buy_volume, sell_volume = buy_sell_volume(df)
            formatted_payload["buy_volume"] = buy_volume
            formatted_payload["sell_volume"] = sell_volume
        except Exception as e:
            print(f"Warning: Failed to calculate buy/sell volume: {str(e)}")
            formatted_payload["buy_volume"] = 0.0
            formatted_payload["sell_volume"] = 0.0
        
        # Metric 3: Trade Volume by Date
        try:
            by_date, by_date_and_side = trade_volume_by_date(df)
            formatted_payload["trade_volume_by_date"] = by_date
            formatted_payload["trade_volume_by_date_and_side"] = by_date_and_side
        except Exception as e:
            print(f"Warning: Failed to calculate trade volume by date: {str(e)}")
            formatted_payload["trade_volume_by_date"] = {}
            formatted_payload["trade_volume_by_date_and_side"] = {}
        
        # Metric 4: Trade Volume by Market Hour
        try:
            volume_by_interval, volume_by_interval_and_side, total_market_volume, total_after_hours_volume  = trade_volume_by_market_hour(df)
            formatted_payload["volume_by_market_interval"] = volume_by_interval
            formatted_payload["volume_by_market_interval_and_side"] = volume_by_interval_and_side
            formatted_payload["total_market_volume"] = total_market_volume
            formatted_payload["total_after_hours_volume"] = total_after_hours_volume
        except Exception as e:
            print(f"Warning: Failed to calculate trade volume by market hour: {str(e)}")
            formatted_payload["volume_by_market_interval"] = {}
            formatted_payload["volume_by_market_interval_and_side"] = {}
            formatted_payload["total_market_volume"] = 0.0
            formatted_payload["total_after_hours_volume"] = 0.0
                
        # Metric 5: K Most Traded Assets
        try:
            top_k_assets = k_most_traded_assets(df, k)
            formatted_payload[f"top_{k}_most_traded_assets"] = top_k_assets
        except Exception as e:
            print(f"Warning: Failed to calculate top {k} most traded assets: {str(e)}")
            formatted_payload[f"top_{k}_most_traded_assets"] = {}
        
        return formatted_payload
    
    except ValueError as e:
        print(f"Error: Invalid data - {str(e)}")
        return {"error": str(e), "status": "failed"}
    except Exception as e:
        print(f"Error: Unexpected error during analytics: {str(e)}")
        return {"error": str(e), "status": "failed"}
# ====================================================================
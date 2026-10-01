import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

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
# ==========


# ========== Buy/Sell Analysis - Count and Volume ==========

def buy_sell_count(df):
    """Calculate buy and sell counts with error handling."""
    try:
        validate_dataframe(df)
        buy_count = int(df[df['order_intent'] == 'BUY'].shape[0])
        sell_count = int(df[df['order_intent'] == 'SELL'].shape[0])
        
        if buy_count == 0 and sell_count == 0:
            raise ValueError("No buy or sell orders found in data")
        
        return buy_count, sell_count
    except KeyError as e:
        raise KeyError(f"Column not found: {e}")
    except Exception as e:
        raise Exception(f"Error calculating buy/sell count: {str(e)}")

def buy_sell_volume(df):
    """Calculate buy and sell volumes with error handling."""
    try:
        validate_dataframe(df)
        
        if 'execution_quantity' not in df.columns:
            raise KeyError("'execution_quantity' column not found in DataFrame")
        
        buy_volume = float(df[df['order_intent'] == 'BUY']['execution_quantity'].sum())
        sell_volume = float(df[df['order_intent'] == 'SELL']['execution_quantity'].sum())
        
        if buy_volume < 0 or sell_volume < 0:
            raise ValueError("Volumes cannot be negative")
        
        if buy_volume == 0 and sell_volume == 0:
            raise ValueError("No volume data found")
        
        return buy_volume, sell_volume
    except KeyError as e:
        raise KeyError(f"Column not found: {e}")
    except Exception as e:
        raise Exception(f"Error calculating buy/sell volume: {str(e)}")
    
# ============================================================


















# ----- Buy/Sell counts -----
    
def visualize_buy_sell_count(buy_count, sell_count, date_tag):
    """Visualize buy vs sell count with error handling."""
    try:
        if buy_count < 0 or sell_count < 0:
            raise ValueError("Counts cannot be negative")
        
        labels = ['BUY', 'SELL']
        counts = [buy_count, sell_count]
        plt.bar(labels, counts)
        plt.title('Buy vs Sell Count')
        plt.savefig(f'visuals/buy_sell_count_{date_tag}.png')
        plt.close()
    except Exception as e:
        print(f"Error visualizing buy/sell count: {str(e)}")
        plt.close()

# --------------------    

# ----- Buy/Sell volume -----

def visualize_buy_sell_volume(buy_volume, sell_volume, date_tag):
    """Visualize buy vs sell volume with error handling."""
    try:
        if buy_volume < 0 or sell_volume < 0:
            raise ValueError("Volumes cannot be negative")
        
        labels = ['BUY', 'SELL']
        volumes = [buy_volume, sell_volume]
        plt.bar(labels, volumes)
        plt.title('Buy vs Sell Volume')
        plt.savefig(f'visuals/buy_sell_volume_{date_tag}.png')
        plt.close()
    except Exception as e:
        print(f"Error visualizing buy/sell volume: {str(e)}")
        plt.close()

# --------------------

# ----- Trade volume by market hour -----
def trade_volume_by_market_hour(df):
    """Calculate trade volume by market hour with error handling."""
    try:
        validate_dataframe(df)
        
        if 'trade_timestamp' not in df.columns:
            raise KeyError("'trade_timestamp' column not found")
        
        # Parse timestamps without modifying the original dataframe
        timestamps = pd.to_datetime(df['trade_timestamp'], errors='coerce')
        
        # Check for parsing errors
        if timestamps.isna().all():
            raise ValueError("Could not parse any timestamps")
        
        # Calculate total minutes since midnight for each timestamp
        total_minutes = timestamps.dt.hour * 60 + timestamps.dt.minute
        
        # Market opens at 9:30am (570 minutes since midnight)
        minutes_since_open = total_minutes - 570
        
        # Calculate 30-minute interval (0-12)
        interval = (minutes_since_open / 30).astype(int)
        interval = interval.clip(0, 12)  # Clamp to valid range
        
        # Group by interval and sum quantities
        volume_by_interval = df.groupby(interval)['execution_quantity'].sum()
        
        # Group by interval and order_intent for stacked bar chart
        volume_by_interval_and_side = df.groupby([interval, 'order_intent'])['execution_quantity'].sum()
        
        if volume_by_interval.empty or volume_by_interval.sum() == 0:
            raise ValueError("No volume data found by market hour")
        
        return volume_by_interval, volume_by_interval_and_side
    except Exception as e:
        raise Exception(f"Error calculating trade volume by market hour: {str(e)}")

def visualize_trade_volume_by_market_hour(volume_by_interval_and_side, date_tag):
    """Visualize trade volume by market hour with stacked bar chart."""
    try:
        if volume_by_interval_and_side is None or volume_by_interval_and_side.empty:
            raise ValueError("Volume data is empty")
        
        # Unstack to get buy and sell volumes as separate columns for each interval
        volume_by_interval = volume_by_interval_and_side.unstack(fill_value=0)
        
        # Create interval labels for 9:30am to 4:00pm (13 x 30-minute intervals)
        start_hour, start_min = 9, 30
        interval_labels = []
        for i in range(13):
            total_mins = start_hour * 60 + start_min + (i * 30)
            hour = total_mins // 60
            minute = total_mins % 60
            interval_labels.append(f"{hour:02d}:{minute:02d}")
        
        plt.figure(figsize=(12, 6))
        
        # Get buy and sell columns if they exist, fill missing intervals with 0
        buy_data = volume_by_interval.get('BUY', pd.Series(0, index=volume_by_interval.index))
        sell_data = volume_by_interval.get('SELL', pd.Series(0, index=volume_by_interval.index))
        
        # Create stacked bar chart with buy (green) bottom and sell (red) on top
        plt.bar(volume_by_interval.index, buy_data, label='BUY', color='green')
        plt.bar(volume_by_interval.index, sell_data, bottom=buy_data, label='SELL', color='red')
        
        plt.title('Trade Volume by 30-Minute Market Interval')
        plt.xlabel('Market Interval')
        plt.ylabel('Volume')
        plt.xticks(range(13), interval_labels, rotation=45)
        plt.legend()
        plt.tight_layout()
        plt.savefig(f'visuals/trade_volume_by_market_interval_{date_tag}.png')
        plt.close()
    except Exception as e:
        print(f"Error visualizing trade volume by market hour: {str(e)}")
        plt.close()


# --------------------

# ----- Trade Volume by Day of the Month -----
def trade_volume_by_day_of_month(df):
    """Calculate trade volume by day of month with error handling."""
    try:
        validate_dataframe(df)
        
        if 'trade_timestamp' not in df.columns:
            raise KeyError("'trade_timestamp' column not found")
        
        # Parse timestamps without modifying the original dataframe
        timestamps = pd.to_datetime(df['trade_timestamp'], errors='coerce')
        
        # Check for parsing errors
        if timestamps.isna().all():
            raise ValueError("Could not parse any timestamps")
        
        # Extract day of the month
        day_of_month = timestamps.dt.day
        
        # Group by day of the month and sum trade volumes
        trade_volume_by_day = df.groupby(day_of_month)['execution_quantity'].sum()
        
        # Group by day and side (buy/sell)
        trade_volume_by_day_and_side = df.groupby([day_of_month, 'order_intent'])['execution_quantity'].sum()
        
        if trade_volume_by_day.empty or trade_volume_by_day.sum() == 0:
            raise ValueError("No volume data found by day of month")
        
        return trade_volume_by_day, trade_volume_by_day_and_side
    except Exception as e:
        raise Exception(f"Error calculating trade volume by day of month: {str(e)}")

def visualize_trade_volume_by_day_of_month(trade_volume_by_day_and_side, date_tag):
    """Visualize trade volume by day of month with error handling."""
    try:
        if trade_volume_by_day_and_side is None or trade_volume_by_day_and_side.empty:
            raise ValueError("Volume data is empty")
        
        # Unstack to get buy and sell volumes as separate columns for each day
        volume_by_day = trade_volume_by_day_and_side.unstack(fill_value=0)
        
        plt.figure(figsize=(12, 6))
        
        # Get buy and sell columns if they exist, fill missing days with 0
        buy_data = volume_by_day.get('BUY', pd.Series(0, index=volume_by_day.index))
        sell_data = volume_by_day.get('SELL', pd.Series(0, index=volume_by_day.index))
        
        # Create stacked bar chart with buy (green) bottom and sell (red) on top
        plt.bar(volume_by_day.index, buy_data, label='BUY', color='green')
        plt.bar(volume_by_day.index, sell_data, bottom=buy_data, label='SELL', color='red')
        
        plt.title(f'Trade Volume by Day of the Month ({date_tag})')
        plt.xlabel('Day of the Month')
        plt.ylabel('Trade Volume')
        plt.xticks(volume_by_day.index)
        plt.legend()
        plt.tight_layout()
        plt.savefig(f'visuals/trade_volume_by_day_of_month_{date_tag}.png')
        plt.close()
    except Exception as e:
        print(f"Error visualizing trade volume by day of month: {str(e)}")
        plt.close()

# --------------------

# ----- Open Market vs After Hours/Pre-Market Trading Volume -----
def open_market_vs_after_hours_volume(df):
    """Calculate trading volume during market hours vs after hours/pre-market."""
    try:
        validate_dataframe(df)
        
        if 'trade_timestamp' not in df.columns:
            raise KeyError("'trade_timestamp' column not found")
        
        # Parse timestamps
        timestamps = pd.to_datetime(df['trade_timestamp'], errors='coerce')
        
        if timestamps.isna().all():
            raise ValueError("Could not parse any timestamps")
        
        # Extract hour from timestamp
        hours = timestamps.dt.hour
        
        # Market hours: 9:30am (9:30) to 4:00pm (16:00)
        # Regular market: 9 <= hour < 16 (9:30am to 3:59:59pm)
        is_market_hours = (hours >= 9) & (hours < 16)
        
        market_volume = df[is_market_hours]['execution_quantity'].sum()
        after_hours_volume = df[~is_market_hours]['execution_quantity'].sum()
        
        if market_volume < 0 or after_hours_volume < 0:
            raise ValueError("Volumes cannot be negative")
        
        if market_volume == 0 and after_hours_volume == 0:
            raise ValueError("No volume data found")
        
        return float(market_volume), float(after_hours_volume)
    except Exception as e:
        raise Exception(f"Error calculating open market vs after hours volume: {str(e)}")

def visualize_open_market_vs_after_hours_volume(market_volume, after_hours_volume, date_tag):
    """Visualize market hours vs after hours trading volume."""
    try:
        if market_volume < 0 or after_hours_volume < 0:
            raise ValueError("Volumes cannot be negative")
        
        labels = ['Market Hours (9:30-16:00)', 'After Hours/Pre-Market']
        volumes = [market_volume, after_hours_volume]
        plt.figure(figsize=(10, 6))
        plt.bar(labels, volumes, color=['blue', 'orange'])
        plt.title('Trading Volume: Market Hours vs After Hours/Pre-Market')
        plt.ylabel('Volume')
        plt.tight_layout()
        plt.savefig(f'visuals/market_vs_after_hours_volume_{date_tag}.png')
        plt.close()
    except Exception as e:
        print(f"Error visualizing market vs after hours volume: {str(e)}")
        plt.close()
# --------------------

# ----- K Most Traded Assets -----
def k_most_traded_assets(df, k=5):
    """Get the k most traded assets by volume."""
    try:
        validate_dataframe(df)
        
        if 'ticker' not in df.columns:
            raise KeyError("'ticker' column not found")
        
        # Group by asset ticker and sum volumes
        asset_volumes = df.groupby('ticker')['execution_quantity'].sum().sort_values(ascending=False)
        
        if asset_volumes.empty:
            raise ValueError("No asset data found")
        
        # Get top k assets
        top_k_assets = asset_volumes.head(k)
        
        if top_k_assets.empty:
            raise ValueError(f"Could not find {k} assets in data")
        
        return top_k_assets
    except Exception as e:
        raise Exception(f"Error calculating k most traded assets: {str(e)}")

def visualize_k_most_traded_assets(top_k_assets, date_tag, k=5):
    """Visualize the k most traded assets."""
    try:
        if top_k_assets is None or top_k_assets.empty:
            raise ValueError("Asset data is empty")
        
        plt.figure(figsize=(12, 6))
        plt.barh(top_k_assets.index, top_k_assets.values)
        plt.title(f'Top {k} Most Traded Assets by Volume')
        plt.xlabel('Total Volume')
        plt.ylabel('Asset Symbol')
        plt.tight_layout()
        plt.savefig(f'visuals/top_{k}_most_traded_assets_{date_tag}.png')
        plt.close()
    except Exception as e:
        print(f"Error visualizing top k most traded assets: {str(e)}")
        plt.close()
# --------------------


# ----- Main analytics function -----
def perform_analytics(df, date_tag, k=5):
    """Perform all analytics with comprehensive error handling."""
    formatted_payload = {}
    
    try:
        # Validate input data
        validate_dataframe(df)
        
        # Metric 1: Buy/Sell Count
        try:
            buy_count, sell_count = buy_sell_count(df)
            visualize_buy_sell_count(buy_count, sell_count, date_tag)
            formatted_payload["buy_count"] = buy_count
            formatted_payload["sell_count"] = sell_count
        except Exception as e:
            print(f"Warning: Failed to calculate buy/sell count: {str(e)}")
            formatted_payload["buy_count"] = 0
            formatted_payload["sell_count"] = 0
        
        # Metric 2: Buy/Sell Volume
        # try:
        #     buy_volume, sell_volume = buy_sell_volume(df)
        #     visualize_buy_sell_volume(buy_volume, sell_volume, date_tag)
        #     formatted_payload["buy_volume"] = buy_volume
        #     formatted_payload["sell_volume"] = sell_volume
        # except Exception as e:
        #     print(f"Warning: Failed to calculate buy/sell volume: {str(e)}")
        #     formatted_payload["buy_volume"] = 0.0
        #     formatted_payload["sell_volume"] = 0.0
        
        # # Metric 3: Trade Volume by Market Hour
        # try:
        #     volume_by_interval, volume_by_interval_and_side = trade_volume_by_market_hour(df)
        #     visualize_trade_volume_by_market_hour(volume_by_interval_and_side, date_tag)
        #     formatted_payload["volume_by_market_interval"] = volume_by_interval.to_dict()
        # except Exception as e:
        #     print(f"Warning: Failed to calculate trade volume by market hour: {str(e)}")
        #     formatted_payload["volume_by_market_interval"] = {}
        
        # # Metric 4: Trade Volume by Day of the Month
        # try:
        #     trade_volume_by_day, trade_volume_by_day_and_side = trade_volume_by_day_of_month(df)
        #     visualize_trade_volume_by_day_of_month(trade_volume_by_day_and_side, date_tag)
        #     formatted_payload["trade_volume_by_day_of_month"] = trade_volume_by_day.to_dict()
        # except Exception as e:
        #     print(f"Warning: Failed to calculate trade volume by day of month: {str(e)}")
        #     formatted_payload["trade_volume_by_day_of_month"] = {}
        
        # # Metric 5: Open Market vs After Hours/Pre-Market Volume
        # try:
        #     market_volume, after_hours_volume = open_market_vs_after_hours_volume(df)
        #     visualize_open_market_vs_after_hours_volume(market_volume, after_hours_volume, date_tag)
        #     formatted_payload["market_hours_volume"] = market_volume
        #     formatted_payload["after_hours_volume"] = after_hours_volume
        # except Exception as e:
        #     print(f"Warning: Failed to calculate market vs after hours volume: {str(e)}")
        #     formatted_payload["market_hours_volume"] = 0.0
        #     formatted_payload["after_hours_volume"] = 0.0
        
        # # Metric 6: K Most Traded Assets
        # try:
        #     top_k_assets = k_most_traded_assets(df, k)
        #     visualize_k_most_traded_assets(top_k_assets, date_tag, k)
        #     formatted_payload[f"top_{k}_most_traded_assets"] = top_k_assets.to_dict()
        # except Exception as e:
        #     print(f"Warning: Failed to calculate top {k} most traded assets: {str(e)}")
        #     formatted_payload[f"top_{k}_most_traded_assets"] = {}
        
        return formatted_payload
    
    except ValueError as e:
        print(f"Error: Invalid data - {str(e)}")
        return {"error": str(e), "status": "failed"}
    except Exception as e:
        print(f"Error: Unexpected error during analytics: {str(e)}")
        return {"error": str(e), "status": "failed"}
# --------------------

# --------------------
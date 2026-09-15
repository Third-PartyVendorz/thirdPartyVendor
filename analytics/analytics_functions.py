import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def json_to_dataframe(json_data):
    return pd.DataFrame(json_data)

# ----- Buy/Sell counts -----
def buy_sell_count(df):
    buy_count = df[df['order_intent'] == 'BUY'].shape[0]
    sell_count = df[df['order_intent'] == 'SELL'].shape[0]
    return buy_count, sell_count
    
def visualize_buy_sell_count(buy_count, sell_count, date_tag):
    labels = ['BUY', 'SELL']
    counts = [buy_count, sell_count]
    plt.bar(labels, counts)
    plt.title('Buy vs Sell Count')
    plt.savefig(f'visuals/buy_sell_count_{date_tag}.png')
    plt.close()
# --------------------    

# ----- Buy/Sell volume -----
def buy_sell_volume(df):
    buy_volume = df[df['order_intent'] == 'BUY']['quantity'].sum()
    sell_volume = df[df['order_intent'] == 'SELL']['quantity'].sum()
    return buy_volume, sell_volume

def visualize_buy_sell_volume(buy_volume, sell_volume, date_tag):
    labels = ['BUY', 'SELL']
    volumes = [buy_volume, sell_volume]
    plt.bar(labels, volumes)
    plt.title('Buy vs Sell Volume')
    plt.savefig(f'visuals/buy_sell_volume_{date_tag}.png')
    plt.close()
# --------------------

# ----- Trade volume by market hour -----
def trade_volume_by_market_hour(df):
    # Parse timestamps without modifying the original dataframe
    timestamps = pd.to_datetime(df['trade_timestamp'])
    
    # Calculate total minutes since midnight for each timestamp
    total_minutes = timestamps.dt.hour * 60 + timestamps.dt.minute
    
    # Market opens at 9:30am (570 minutes since midnight)
    minutes_since_open = total_minutes - 570
    
    # Calculate 30-minute interval (0-12)
    interval = (minutes_since_open / 30).astype(int)
    interval = interval.clip(0, 12)  # Clamp to valid range
    
    # Group by interval and sum quantities
    volume_by_interval = df.groupby(interval)['quantity'].sum()
    
    return volume_by_interval

def visualize_trade_volume_by_market_hour(volume_by_interval, date_tag):
    # Create interval labels for 9:30am to 4:00pm (13 x 30-minute intervals)
    start_hour, start_min = 9, 30
    interval_labels = []
    for i in range(13):
        total_mins = start_hour * 60 + start_min + (i * 30)
        hour = total_mins // 60
        minute = total_mins % 60
        interval_labels.append(f"{hour:02d}:{minute:02d}")
    
    # Create histogram with 13 intervals
    plt.figure(figsize=(12, 6))
    plt.bar(range(13), [volume_by_interval.get(i, 0) for i in range(13)])
    plt.title('Trade Volume by 30-Minute Market Interval')
    plt.xlabel('Market Interval')
    plt.ylabel('Volume')
    plt.xticks(range(13), interval_labels, rotation=45)
    plt.tight_layout()
    plt.savefig(f'visuals/trade_volume_by_market_interval_{date_tag}.png')
    plt.close()
# --------------------

# ----- Main analytics function -----
def perform_analytics(df, date_tag):
    formatted_payload = {}
    buy_count, sell_count = buy_sell_count(df)
    visualize_buy_sell_count(buy_count, sell_count, date_tag)
    buy_volume, sell_volume = buy_sell_volume(df)
    visualize_buy_sell_volume(buy_volume, sell_volume, date_tag)
    volume_by_interval = trade_volume_by_market_hour(df)
    visualize_trade_volume_by_market_hour(volume_by_interval, date_tag)
    formatted_payload = {
        "buy_count": buy_count,
        "sell_count": sell_count,
        "buy_volume": buy_volume,
        "sell_volume": sell_volume,
        "volume_by_market_interval": volume_by_interval.to_dict()
    }
    return formatted_payload
# --------------------
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
        
        
        
        
        
def visualize_trade_volume_by_market_hour(volume_by_interval_and_side, date_tag):
    """Visualize trade volume by market hour with stacked bar chart."""
    try:
        if volume_by_interval_and_side is None or volume_by_interval_and_side.empty:
            raise ValueError("Volume data is empty")
        
        # Unstack to get buy and sell volumes as separate columns for each interval
        volume_by_interval = volume_by_interval_and_side.unstack(fill_value=0)
        
        # Create interval labels for 9:30am to 4:00pm (13 x 30-minute intervals) + after-hours
        start_hour, start_min = 9, 30
        interval_labels = []
        for i in range(13):
            total_mins = start_hour * 60 + start_min + (i * 30)
            hour = total_mins // 60
            minute = total_mins % 60
            interval_labels.append(f"{hour:02d}:{minute:02d}")
        interval_labels.append("After-Hours")  # 14th bucket
        
        plt.figure(figsize=(14, 6))
        
        # Get buy and sell columns if they exist, fill missing intervals with 0
        buy_data = volume_by_interval.get('BUY', pd.Series(0, index=volume_by_interval.index))
        sell_data = volume_by_interval.get('SELL', pd.Series(0, index=volume_by_interval.index))
        
        # Create stacked bar chart with buy (green) bottom and sell (red) on top
        plt.bar(volume_by_interval.index, buy_data, label='BUY', color='green')
        plt.bar(volume_by_interval.index, sell_data, bottom=buy_data, label='SELL', color='red')
        
        plt.title('Trade Volume by 30-Minute Market Interval')
        plt.xlabel('Market Interval')
        plt.ylabel('Volume')
        plt.xticks(range(1, 15), interval_labels, rotation=45)
        plt.legend()
        plt.tight_layout()
        plt.savefig(f'visuals/trade_volume_by_market_interval_{date_tag}.png')
        plt.close()
    except Exception as e:
        print(f"Error visualizing trade volume by market hour: {str(e)}")
        plt.close()


# --------------------

# ----- Trade Volume by Day of the Month -----    """Visualize trade volume by day of month with error handling."""
    # try:
    #     if trade_volume_by_day_and_side is None or trade_volume_by_day_and_side.empty:
    #         raise ValueError("Volume data is empty")
        
    #     # Unstack to get buy and sell volumes as separate columns for each day
    #     volume_by_day = trade_volume_by_day_and_side.unstack(fill_value=0)
        
    #     plt.figure(figsize=(12, 6))
        
    #     # Get buy and sell columns if they exist, fill missing days with 0
    #     buy_data = volume_by_day.get('BUY', pd.Series(0, index=volume_by_day.index))
    #     sell_data = volume_by_day.get('SELL', pd.Series(0, index=volume_by_day.index))
        
    #     # Create stacked bar chart with buy (green) bottom and sell (red) on top
    #     plt.bar(volume_by_day.index, buy_data, label='BUY', color='green')
    #     plt.bar(volume_by_day.index, sell_data, bottom=buy_data, label='SELL', color='red')
        
    #     plt.title(f'Trade Volume by Day of the Month ({date_tag})')
    #     plt.xlabel('Day of the Month')
    #     plt.ylabel('Trade Volume')
    #     plt.xticks(volume_by_day.index)
    #     plt.legend()
    #     plt.tight_layout()
    #     plt.savefig(f'visuals/trade_volume_by_day_of_month_{date_tag}.png')
    #     plt.close()
    # except Exception as e:
    #     print(f"Error visualizing trade volume by day of month: {str(e)}")
    #     plt.close()

# --------------------






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
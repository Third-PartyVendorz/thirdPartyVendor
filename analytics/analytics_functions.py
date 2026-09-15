import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def json_to_dataframe(json_data):
    return pd.DataFrame(json_data)


# function for visuals
# function for basic analytics

def buy_sell_count(df):
    buy_count = df[df['order_intent'] == 'BUY'].shape[0]
    sell_count = df[df['order_intent'] == 'SELL'].shape[0]
    return buy_count, sell_count
    
def visualize_buy_sell_count(buy_count, sell_count):
    labels = ['BUY', 'SELL']
    counts = [buy_count, sell_count]
    plt.bar(labels, counts)
    plt.title('Buy vs Sell Count')
    plt.savefig('visuals/buy_sell_count.png')
    plt.close()
 
    
def buy_sell_volume(df):
    buy_volume = df[df['order_intent'] == 'BUY']['quantity'].sum()
    sell_volume = df[df['order_intent'] == 'SELL']['quantity'].sum()
    return buy_volume, sell_volume



def perform_analytics(df):
    formatted_payload = {}
    buy_count, sell_count = buy_sell_count(df)
    visualize_buy_sell_count(buy_count, sell_count)
    buy_volume, sell_volume = buy_sell_volume(df)
    formatted_payload = {
        "buy_count": buy_count,
        "sell_count": sell_count,
        "buy_volume": buy_volume,
        "sell_volume": sell_volume
    }
    return formatted_payload
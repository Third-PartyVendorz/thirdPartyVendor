from pathlib import Path
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt

BASE = Path(__file__).resolve().parent[2]

def extract():
    """"read csv file and return it unchanged"""
    df = pd.read_csv(BASE)
    return df

def transform():
    """apply data cleaning and preparation to dataframe"""
    # drop any duplicate entries
    df = df.drop_duplicates()
    
    # ensure asset classes map to allowed asset classes
    CANONICAL_ASSET_CLASSES = {"equity": "Equity", "etf": "ETF", "bond": "Bond", "crypto": "Crypto"}
    df["asset_class"] = df["asset_class"].str.lower().map(CANONICAL_ASSET_CLASSES)
    
    # drop rows where ____ is missing
    # df = df[df["quantity"].notna()]
    
    return df

def load(df, out_file_path):
    """write df to a out_file_path as a CSV and return file_out_path"""
    with open(out_file_path, "w") as f:
        f.write(df)
    return out_file_path


# compute insights from data using exploratory data analysis
# group trade volume by instrument
def trade_volume_by_instrument(df):
    return df.groupby("instrument")["quantity"].sum()

# find total sum of trade values by client
def trade_value_totals_by_client(df):
    return df.groupby("client_name")["value"].sum()

def trade_value_totals_by_asset_class(df):
    return df.groupby("asset_class")["value"].sum()


# create visualizations
# create a bar chart for value by trade asset class
def chart_value_by_asset_class(clean_data):
    totals = clean_data.groupby("asset_class")["value"].sum()
    fig, ax = plt.subplots()
    ax.bar(totals.index, totals.values)
    ax.set_ylim(bottom=0)
    ax.set_title("Total Trade Value by Asset Class")
    ax.set_xlabel("Asset Class")
    ax.set_ylabel("Total Value")
    return fig, ax



# print dashboard information understandable to non-technical audiences
def print_dashboard_info(df):
    print("Trade Volume by Instrument:")
    print(trade_volume_by_instrument(df))
    print("\nTrade Value Totals by Client:")
    print(trade_value_totals_by_client(df))
    print("\nTotal Trade Value by Asset Class:")
    print(trade_value_totals_by_asset_class(df))
    print("\nChart Value by Asset Class:")
    fig, ax = chart_value_by_asset_class(df)
    plt.show()
from pathlib import Path
import pandas as pd

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
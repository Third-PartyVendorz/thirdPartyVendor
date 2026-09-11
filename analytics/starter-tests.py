import pytest
from analytics_script import extract, transform, load

VALID_ASSET_CLASSES = {"Equity", "ETF", "Bond", "Crypto"}

@pytest.fixture
def clean_trades():
    return transform(extract())

# 1. price is always positive for values where price is not null
def test_no_negative_or_zero_price(clean_trades):
    assert (clean_trades.loc[clean_trades["price"].notna(), "price"] > 0).all()
    
# 2. quantity is always positive for values where quantity is not null
def test_no_negative_or_zero_quantity(clean_trades):
    assert (clean_trades.loc[clean_trades["quantity"].notna(), "quantity"] > 0).all()
    
# 3. asset_class is always one of the allowed canonical asset classes
def test_asset_class_is_canonical(clean_trades):
    assert clean_trades["asset_class"].isin(VALID_ASSET_CLASSES).all()
    
# 4. no missing trade ids
def test_no_missing_trade_ids(clean_trades):
    assert clean_trades["trade_id"].notna().all()
    
# 5. no duplicate trade id values
def test_no_duplicate_trade_ids(clean_trades):
    assert clean_trades["trade_id"].is_unique()
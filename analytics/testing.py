import db_functions as db
import misc_functions as msc
import pandas as pd
import analytics_functions as a


query = msc.get_current_month_trades_query()
conn = db.open_db_connection()

month, year, date_tag = msc.get_date_tag()
results = db.execute_fetch_query(query, conn)


df = a.json_to_dataframe(results)

if(a.validate_dataframe(df)):
    print("Dataframe is valid")    
    
    # print(a.buy_sell_count(df))
    
    # print(a.buy_sell_volume(df))
    
    # print(a.trade_volume_by_market_hour(df)[0])
    
    # print(a.trade_volume_by_market_hour(df)[1])
    
    # print(a.trade_volume_by_market_hour(df)[2])
    
    # print(a.trade_volume_by_market_hour(df)[3])
    
    # print(a.k_most_traded_assets(df))
    
    
    
    print(a.trade_volume_by_date(df)[0])
    
    print(a.trade_volume_by_date(df)[1])
        
else:
    print("Dataframe is invalid")
    
    


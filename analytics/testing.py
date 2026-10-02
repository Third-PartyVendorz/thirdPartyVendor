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
    print(a.perform_analytics(df, date_tag))
    
else:
    print("Dataframe is invalid")
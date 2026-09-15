import db_functions as db
import misc_functions as msc
import analytics_functions as af

import pandas as pd

def run_analytics_job():
    query = msc.get_previous_month_trades_query()
    conn = db.open_db_connection()

    results = db.execute_fetch_query(query, conn)

    #save raw data as csv file
    df = pd.DataFrame(results)
    df.to_csv(f'../analytics/raw-data/raw_data_{str(df["trade_timestamp"].iloc[0])[:7]}.csv', index=False)

    #Pass results to analytics functions
    analytics_payload = af.perform_analytics(df)

    # print(analytics_payload)

    # print(df['status'].unique())
    # print(analytics_payload)

    db.close_db_connection(conn)

    print("Analytics job completed successfully.")
    
    return analytics_payload




import db_functions as db
import misc_functions as msc
import analytics_functions as af

import pandas as pd

def run_analytics_job():
    query = msc.get_current_month_trades_query()
    conn = db.open_db_connection()

    month, year, date_tag = msc.get_date_tag()
    results = db.execute_fetch_query(query, conn)

    df = pd.DataFrame(results)

    analytics_payload = af.perform_analytics(df)

    db.close_db_connection(conn)

    print("Analytics job completed successfully.")
    
    return analytics_payload

def run_custom_analytics_job(start_date, end_date):
    query, params = msc.get_custom_date_trades_query(start_date, end_date)
    conn = db.open_db_connection()

    results = db.execute_fetch_query_with_params(query, params, conn)

    df = pd.DataFrame(results)

    analytics_payload = af.perform_analytics(df)

    db.close_db_connection(conn)

    print("Custom analytics job completed successfully.")
    
    return analytics_payload
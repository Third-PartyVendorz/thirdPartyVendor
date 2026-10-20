import db_functions as db
import misc_functions as msc
import analytics_functions as af

import pandas as pd

date_map = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December"
}

def run_analytics_job():
    query, params = msc.get_current_month_trades_query()
    conn = db.open_db_connection()

    month, year, date_tag = msc.get_date_tag()
    results = db.execute_fetch_query_with_params(query, params, conn)

    df = pd.DataFrame(results)

    analytics_payload = af.perform_analytics(df)
    
    analytics_payload["date"] = f"{date_map[f'{month:02d}']} {year}"

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
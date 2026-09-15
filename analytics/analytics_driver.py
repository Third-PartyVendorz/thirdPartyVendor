import db_functions as db
import misc_functions as msc

import pandas as pd

query = msc.get_previous_month_trades_query()

conn = db.open_db_connection()

#Get results
results = db.execute_fetch_query(query, conn)

#save raw data as csv file

#Pass results to analytics functions





db.close_db_connection(conn)

# for r in results:
#     print(r)
#     print('----------')


df = pd.DataFrame(results)
print(len(df.columns))
print(df.columns)
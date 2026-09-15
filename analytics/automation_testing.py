import psycopg2

print(psycopg2.__version__)

try:
    conn = psycopg2.connect(
        dbname="tpvdb",
        user="postgres",
        password="postgres",
        host="localhost",
        port="5432"
    )
    print("Connection successful")
    
    query = "SELECT * FROM Orders;"
    
    cur = conn.cursor()
    cur.execute(query)
    rows = cur.fetchall()
    for row in rows:
        print(row)
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")



import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

db_config = {
    "dbname": os.getenv("POSTGRES_DB"),
    "user": os.getenv("POSTGRES_USER"),
    "password": os.getenv("POSTGRES_PASSWORD"),
    "host": os.getenv("POSTGRES_HOST"),
    "port": os.getenv("POSTGRES_HOST_PORT")
}

def open_db_connection():
    conn = psycopg2.connect(**db_config)
    conn.autocommit = True
    return conn

def close_db_connection(conn):
    if conn:
        conn.close()
        
def execute_query(query, conn):
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute(query)

def execute_fetch_query(query, conn):
    with conn.cursor() as cur:
        cur.execute(query)

        columns = [desc[0] for desc in cur.description]
        rows = cur.fetchall()

        return [
            dict(zip(columns, row))
            for row in rows
        ]
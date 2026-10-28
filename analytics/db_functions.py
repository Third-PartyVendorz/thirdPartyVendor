import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_config():
    # DB_* is the deployment contract; keep local POSTGRES_* settings working.
    aliases = {
        "dbname": ("DB_NAME", "POSTGRES_DB"),
        "user": ("DB_USER", "POSTGRES_USER"),
        "password": ("DB_PASSWORD", "POSTGRES_PASSWORD"),
        "host": ("DB_HOST", "POSTGRES_HOST"),
    }
    config = {
        key: os.getenv(name, os.getenv(legacy_name))
        for key, (name, legacy_name) in aliases.items()
    }
    missing = [aliases[key][0] for key, value in config.items() if not value]
    if missing:
        raise ValueError("Missing database environment variables: " + ", ".join(missing))

    port = os.getenv("DB_PORT", os.getenv("POSTGRES_HOST_PORT", "5432"))
    try:
        config["port"] = int(port)
    except ValueError:
        raise ValueError("DB_PORT (or POSTGRES_HOST_PORT) must be an integer") from None
    if not 1 <= config["port"] <= 65535:
        raise ValueError("DB_PORT (or POSTGRES_HOST_PORT) must be between 1 and 65535")

    config["connect_timeout"] = 5
    config["sslmode"] = os.getenv("DB_SSLMODE", "prefer")
    if os.getenv("DB_SSLROOTCERT"):
        config["sslrootcert"] = os.environ["DB_SSLROOTCERT"]
    return config

def open_db_connection():
    conn = psycopg2.connect(**get_db_config())
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
        
def execute_fetch_query_with_params(query, params, conn):
    with conn.cursor() as cur:
        cur.execute(query, params)

        columns = [desc[0] for desc in cur.description]
        rows = cur.fetchall()

        return [
            dict(zip(columns, row))
            for row in rows
        ]
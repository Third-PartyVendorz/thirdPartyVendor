"""Lambda connectivity check for the private PostgreSQL RDS instance."""

import os
from pathlib import Path

import psycopg2


def lambda_handler(event, context):
    """Connect using Terraform-provided settings and return the server version."""
    conn = psycopg2.connect(
        host=os.environ["DB_HOST"],
        port=int(os.environ.get("DB_PORT", "5432")),
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        sslmode="verify-full",
        sslrootcert=str(Path(__file__).with_name("global-bundle.pem")),
        connect_timeout=5,
        options="-c statement_timeout=10000",
    )
    try:
        with conn.cursor() as cur:
            # cur.execute("SELECT version();")
            q1 = "CREATE TABLE test(id SERIAL PRIMARY KEY, name TEXT);"
            cur.execute(q1)
            
            q2 = "INSERT INTO test(name) VALUES('test name');"
            cur.execute(q2)
            conn.commit()

            # version = cur.fetchone()[0]
        return {"statusCode": 200, "message": "Table created successfully"}
    finally:
        # A psycopg2 connection context manager alone does not close the socket.
        conn.close()
from flask import Flask

import psycopg2
import os
from flask import jsonify


app = Flask(__name__)


@app.get("/")
def health_check():
	return "mock api is running"

@app.get("/db")
def db_health_check():
    return db_check()


def db_check():
    try:
        connection = psycopg2.connect(
            host=os.environ["DB_HOST"],
            port=int(os.environ.get("DB_PORT", "5432")),
            dbname=os.environ["DB_NAME"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            sslmode="verify-full",
            sslrootcert="/app/global-bundle.pem",
            connect_timeout=5,
            options="-c statement_timeout=5000",
        )

        try:
            connection.set_session(readonly=True)
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM test;")
                result = cursor.fetchone()[0]
        finally:
            connection.close()

        return jsonify(ok=True, result=result)
    except (psycopg2.Error, KeyError, ValueError) as exc:
        app.logger.warning("Database connectivity check failed (%s): %s", type(exc).__name__, exc)
        return jsonify(ok=False, error="Database unavailable"), 503



if __name__ == "__main__":
	app.run(host="0.0.0.0", port=8080)

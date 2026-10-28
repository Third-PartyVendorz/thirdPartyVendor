from flask import Flask, jsonify, request
from flask_cors import CORS
from analytics_driver import run_analytics_job, run_custom_analytics_job
from datetime import timedelta, datetime

from dotenv import load_dotenv
import os

from flask_jwt_extended import JWTManager, get_jwt, jwt_required


load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)


app.config["JWT_SECRET_KEY"] = os.getenv("APP_JWT_SECRET")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(milliseconds=int(os.getenv("APP_JWT_EXPIRATION_MS", 86400000)))
app.config["JWT_ALGORITHM"] = "HS512"
app.config["JWT_DECODE_ALGORITHMS"] = ["HS512"]
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
app.config["JWT_ACCESS_COOKIE_NAME"] = "authToken"


jwt = JWTManager(app)


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify(msg=error), 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify(msg="Token has expired"), 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify(msg=error), 401


@app.route('/', methods=['GET'])
def health():
    return jsonify(status="ok"), 200


@app.route('/analytics', methods=['GET'])
@jwt_required()
def analytics():
    jwt_payload = get_jwt()

    if jwt_payload.get("role") != "ANALYST":
        return jsonify(msg="Analyst role required"), 403
    
    analytics_payload = None
    
    start_date = request.args.get('startDate', None)
    end_date = request.args.get('endDate', None)
    
    if start_date and end_date:
        analytics_payload = run_custom_analytics_job(start_date, end_date)
    else:
        analytics_payload = run_analytics_job()
    
    return jsonify(analytics_payload)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8089)
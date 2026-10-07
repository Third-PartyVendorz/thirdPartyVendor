from flask import Flask, jsonify, request
from flask_cors import CORS
from analytics_driver import run_analytics_job, run_custom_analytics_job

app = Flask(__name__)
CORS(app)

@app.route('/analytics', methods=['GET'])
def analytics():
    
    analytics_payload = None
    
    start_date = request.args.get('startDate', None)
    end_date = request.args.get('endDate', None)
    
    if start_date and end_date:
        analytics_payload = run_custom_analytics_job(start_date, end_date)
    else:
        analytics_payload = run_analytics_job()
    
    return jsonify(analytics_payload)

if __name__ == '__main__':
    app.run(port=8089,debug=True)
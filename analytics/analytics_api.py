from flask import Flask, jsonify, request
from flask_cors import CORS
from analytics_driver import run_analytics_job

app = Flask(__name__)
CORS(app)

@app.route('/analytics', methods=['GET'])
def analytics():
    
    start_date = request.args.get('startDate', None)
    end_date = request.args.get('endDate', None)
    
    if start_date and end_date:
        print(f"Start date received: {start_date}")
        print(f"End date received: {end_date}")
    else:
        print("Start date or end date not received")
    
    #Basic for now just want to get structure so that skeleton for further analytics is all there

    analytics_payload = run_analytics_job()
    return jsonify(analytics_payload)

if __name__ == '__main__':
    app.run(port=8089,debug=True)
from flask import Flask, jsonify, request
from analytics_driver import run_analytics_job

app = Flask(__name__)

@app.route('/analytics', methods=['POST'])
def analytics():
    data = request.get_json()
    
    #Basic for now just want to get structure so that skeleton for further analytics is all there

    analytics_payload = run_analytics_job()
    return jsonify(analytics_payload)

if __name__ == '__main__':
    app.run(debug=True)
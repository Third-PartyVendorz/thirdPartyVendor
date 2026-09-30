from flask import Flask, jsonify, request
from flask_cors import CORS
from analytics_driver import run_analytics_job

app = Flask(__name__)
CORS(app)

@app.route('/analytics', methods=['GET'])
def analytics():
    data = request.get_json(silent=True)
    
    #Basic for now just want to get structure so that skeleton for further analytics is all there

    analytics_payload = run_analytics_job()
    return jsonify(analytics_payload)

if __name__ == '__main__':
    app.run(port=8089,debug=True)
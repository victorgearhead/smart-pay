from flask import Flask, request, jsonify
import random
import time
from datetime import datetime

app = Flask(__name__)

# Health Check
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

# Fraud Detection - XGBoost Mock
@app.route('/fraud-xgboost-endpoint-local/invocations', methods=['POST'])
def fraud_xgboost():
    data = request.get_json(force=True)
    # Simulate latency
    time.sleep(0.1 + random.random() * 0.2)
    instances = data.get('instances', [data])
    predictions = []
    for inst in instances:
        amount = inst.get('amount', 0)
        score = 0.05 + (0.3 if amount > 5000 else 0.15 if amount > 1000 else 0)
        score += random.uniform(-0.1, 0.1)
        score = min(max(score, 0.01), 0.95)
        predictions.append({'score': round(score, 4)})
    return jsonify({'predictions': predictions})

# Routing - Vowpal Wabbit Bandit Mock
@app.route('/routing-vw-bandit-endpoint-local/invocations', methods=['POST'])
def routing_vw():
    data = request.get_json(force=True)
    time.sleep(0.05 + random.random() * 0.1)
    # Simple rule: low amount->solana, high risk->stripe, else random
    ctx = data.get('context_features', {})
    amt_log = ctx.get('amount_log', 5)
    risk = ctx.get('risk_score', 0)
    if amt_log < 4:
        action = 2  # solana
    elif risk > 0.5:
        action = 0  # stripe
    else:
        action = random.choice([0,1,2])
    prob = round(0.7 + random.uniform(0,0.2), 4)
    return jsonify({
        'action_id': action,
        'probability': prob,
        'exploration': prob < 0.8,
        'expected_reward': round(0.8 + random.uniform(0,0.15), 4)
    })

if __name__ == '__main__':
    print("🚀 Mock SageMaker Server running on port 8080")
    app.run(host='0.0.0.0', port=8080)

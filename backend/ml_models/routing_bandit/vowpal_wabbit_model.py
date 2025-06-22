
import numpy as np
import json
import os
from vowpalwabbit import pyvw
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RoutingContextualBandit:
    def __init__(self, num_actions=3):
        self.num_actions = num_actions
        self.vw_model = None
        self.action_names = ['Stripe', 'AmazonPay', 'Solana']
        self.feature_names = [
            'amount_log', 'risk_score', 'hour', 'day_of_week', 'is_weekend',
            'merchant_type', 'region', 'currency'
        ]
        
    def initialize_model(self, learning_rate=0.1, epsilon=0.1):
        """Initialize Vowpal Wabbit contextual bandit model"""
        vw_args = f"--cb_explore_adf --epsilon {epsilon} -l {learning_rate} --power_t 0 --cb_type mtr"
        self.vw_model = pyvw.vw(vw_args)
        logger.info(f"Initialized VW model with args: {vw_args}")
        
    def format_context_features(self, context):
        """Format context features for VW"""
        features = []
        
        features.append(f"amount_log:{context.get('amount_log', 0):.3f}")
        features.append(f"risk_score:{context.get('risk_score', 0):.3f}")
        features.append(f"hour:{context.get('hour', 0)}")
        features.append(f"day_of_week:{context.get('day_of_week', 0)}")
        features.append(f"is_weekend:{context.get('is_weekend', 0)}")
        
        merchant_type = context.get('merchant_type', 'unknown')
        features.append(f"merchant_{merchant_type}")
        
        region = context.get('region', 'unknown').replace(' ', '_')
        features.append(f"region_{region}")
        
        currency = context.get('currency_code', 0)
        features.append(f"currency:{currency}")
        
        return " ".join(features)
    
    def format_action_features(self, action_id, action_data):
        """Format action-specific features for VW"""
        features = []
        
        features.append(f"success_rate:{action_data.get('success_rate', 95):.2f}")
        features.append(f"cost:{action_data.get('cost', 2.5):.2f}")
        features.append(f"latency:{action_data.get('latency', 200)}")
        features.append(f"supports_region:{action_data.get('supports_region', 1)}")
        features.append(f"supports_amount:{action_data.get('supports_amount', 1)}")
        features.append(f"volume:{action_data.get('volume', 100)}")
        
        features.append(f"gateway_{self.action_names[action_id]}")
        
        return " ".join(features)
    
    def create_vw_example(self, context, actions, chosen_action=None, reward=None):
        """Create VW example in CB ADF format"""
        context_features = self.format_context_features(context)
        
        if chosen_action is not None and reward is not None:
            
            shared_line = f"shared |s {context_features}"
        else:
            shared_line = f"shared |s {context_features}"
        
        action_lines = []
        for i, action_data in enumerate(actions):
            action_features = self.format_action_features(i, action_data)
            
            if chosen_action is not None and reward is not None:
                
                if i == chosen_action:
                    cost = max(0.0, 1.0-reward)
                    action_line = f"{i}:{cost:.3f}:1 |a {action_features}"
                else:
                    action_line = f"|a {action_features}"
            else:
                action_line = f"|a {action_features}"
            
            action_lines.append(action_line)
        
        return shared_line, action_lines
    
    def train_step(self, context, actions, chosen_action, reward):
        """Single training step"""
        if self.vw_model is None:
            self.initialize_model()
        
        shared_line, action_lines = self.create_vw_example(
            context, actions, chosen_action, reward
        )
        
        example_lines = [shared_line] + action_lines
        example = "\n".join(example_lines)
        
        self.vw_model.learn(example)
        
        logger.debug(f"Trained on example with reward {reward} for action {chosen_action}")
    
    def predict(self, context, actions):
        """Predict best action and probabilities"""
        if self.vw_model is None:
            self.initialize_model()
        
        shared_line, action_lines = self.create_vw_example(context, actions)
        
        example_lines = [shared_line] + action_lines
        example = "\n".join(example_lines)
        
        predictions = self.vw_model.predict(example)
        
        if isinstance(predictions, list):
            action_probs = predictions
        else:
            action_probs = [predictions] + [0.0] * (self.num_actions - 1)
        
        chosen_action = np.argmax(action_probs)
        confidence = max(action_probs)
        
        exploration = confidence < 0.7
        
        return {
            'chosen_action': int(chosen_action),
            'action_probability': float(confidence),
            'exploration': exploration,
            'expected_reward': float(confidence),
            'all_probabilities': [float(p) for p in action_probs]
        }
    
    def batch_train(self, training_data):
        """Train on batch of data"""
        if self.vw_model is None:
            self.initialize_model()
        
        logger.info(f"Training on {len(training_data)} examples")
        
        for example in training_data:
            self.train_step(
                example['context'],
                example['actions'],
                example['chosen_action'],
                example['reward']
            )
        
        logger.info("Batch training completed")
    
    def save_model(self, path):
        """Save VW model"""
        if self.vw_model is None:
            raise ValueError("No model to save")
        
        self.vw_model.save(path)
        logger.info(f"Model saved to {path}")
    
    def load_model(self, path):
        if not os.path.exists(path):
            raise FileNotFoundError(f"{path} not found")

        vw_args = (
            f"--cb_explore_adf "
            f"--epsilon 0.1 "         
            f"-l 0.1 "               
            f"--power_t 0 "
            f"--cb_type mtr "
            f"-i {path} "          
            "--quiet"             
        )

        self.vw_model = pyvw.vw(vw_args)
        logger.info(f"Loaded VW model from {path} with args: {vw_args}")

from flask import Flask, request, jsonify

app = Flask(__name__)
bandit_model = RoutingContextualBandit()

@app.route('/routing-vw-bandit-endpoint-local/ping', methods=['GET'])
def ping():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

@app.route('/ping', methods=['GET'])
def ping():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

@app.route('/routing-vw-bandit-endpoint-local/invocations', methods=['POST'])
def predict():
    """Prediction endpoint"""
    try:
        data = request.get_json()
        
        context = data.get('context_features', {})
        actions = data.get('actions', [])
        
        result = bandit_model.predict(context, actions)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/routing-vw-bandit-endpoint-local/train', methods=['POST'])
def train():
    """Training endpoint for online learning"""
    try:
        data = request.get_json()
        
        context = data.get('context_features', {})
        actions = data.get('actions', [])
        chosen_action = data.get('chosen_action')
        reward = data.get('reward')
        
        if chosen_action is None or reward is None:
            return jsonify({'error': 'chosen_action and reward required for training'}), 400
        
        bandit_model.train_step(context, actions, chosen_action, reward)
        
        return jsonify({'status': 'training_completed'})
        
    except Exception as e:
        logger.error(f"Training error: {str(e)}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    bandit_model.initialize_model()
    
    model_path = os.environ.get('ml_models/routing_bandit', './routing_model.vw')
    if os.path.exists(model_path):
        bandit_model.load_model(model_path)
    
    app.run(host='0.0.0.0', port=8080)

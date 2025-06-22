import pandas as pd
import numpy as np
import logging
# from sklearn.preprocessing import StandardScaler
from vowpal_wabbit_model import RoutingContextualBandit

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def safe_float(x, default=0.0):
    try:
        v = float(x)
        return v if np.isfinite(v) else default
    except:
        return default

def main():
    # 1) Load your CSV
    csv_path = "routing_synthetic.csv"
    logger.info(f"Loading dataset from {csv_path}…")
    df = pd.read_csv(csv_path)
    logger.info(f"→ {len(df)} rows loaded")

    # 2) Normalize numeric context features
    ctx_feats = ['amount_log', 'risk_score', 'hour', 'day_of_week']
    # scaler = StandardScaler()
    # df[ctx_feats] = scaler.fit_transform(df[ctx_feats])
    df['is_weekend'] = df['is_weekend'].astype(int)
    logger.info("Context features normalized")

    # 3) Build training examples
    training_data = []
    for idx, row in df.iterrows():
        # Context
        context = {
            'amount_log':   safe_float(row['amount_log']),
            'risk_score':   safe_float(row['risk_score']),
            'hour':         safe_float(row['hour']),
            'day_of_week':  safe_float(row['day_of_week']),
            'is_weekend':   int(row['is_weekend']),
            'merchant_type': str(row['merchant_type']),
            'region':       str(row['region']),
            'currency_code': safe_float(row['currency_code'])
        }

        # Actions (3 of them)
        actions = []
        for i in range(3):
            actions.append({
                'success_rate':    safe_float(row[f'action{i}_success_rate'], 0.0),
                'cost':            safe_float(row[f'action{i}_cost'],          0.0),
                'latency':         safe_float(row[f'action{i}_latency'],       0.0),
                'supports_region': int(row[f'action{i}_supports_region']),
                'supports_amount': int(row[f'action{i}_supports_amount']),
                'volume':          safe_float(row[f'action{i}_volume'],        0.0)
            })

        chosen = int(row['chosen_action'])
        reward = safe_float(row['reward'], 0.0)

        training_data.append({
            'context': context,
            'actions': actions,
            'chosen_action': chosen,
            'reward': reward
        })

    # 4) Train
    bandit = RoutingContextualBandit()
    bandit.initialize_model(learning_rate=0.1, epsilon=0.1)
    logger.info(f"Starting batch training on {len(training_data)} examples…")
    bandit.batch_train(training_data)

    # 5) Save
    model_path = "routing_model.vw"
    bandit.save_model(model_path)
    logger.info(f"Model written to {model_path}")

if __name__ == "__main__":
    main()

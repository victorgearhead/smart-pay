import os
import pandas as pd
import numpy as np
from xgboost_model import FraudDetectionXGBoost

def csv_main():
    csv_in = 'creditcard.csv'
    csv_out = 'creditcard_augmented.csv'

    if not os.path.exists(csv_in):
        raise FileNotFoundError(
            f"Please download 'creditcard.csv' into this folder before running."
        )

    df = pd.read_csv(csv_in)

    df = df.rename(columns={
        'Time':   'time_seconds',
        'Class':  'isFraud',
        'Amount': 'amount'
    })

    df['timestamp'] = pd.to_datetime(
        df['time_seconds'],
        unit='s',
        origin='unix'
    )
    df.drop(columns=['time_seconds'], inplace=True)

    df['userId'] = ['user_' + str(i % 1000) for i in df.index]

    categories = [
        'online_retail', 'electronics', 'luxury_goods',
        'travel', 'subscription', 'gambling'
    ]
    df['merchantCategory'] = np.random.choice(categories, size=len(df))

    locations = [
        'San Francisco, CA', 'New York, NY',
        'unknown', 'tor_network', 'vpn'
    ]
    df['location'] = np.random.choice(locations, size=len(df))

    devices = [
        'Chrome/Mac', 'Firefox/Windows',
        'Safari/iOS', 'AndroidApp', 'emulator'
    ]
    df['deviceInfo'] = np.random.choice(devices, size=len(df))

    df['previousDeclines']  = np.random.poisson(lam=0.1, size=len(df))
    df['velocityLastHour']  = np.random.poisson(lam=0.5, size=len(df))

    df.to_csv(csv_out, index=False)
    print(f"Augmented dataset written to '{csv_out}' ({len(df)} rows).")

def main():
    csv_path = 'creditcard_augmented.csv'
    model_path = 'fraud_model.joblib'

    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Augmented file '{csv_path}' not found. Run 'augment_creditcard.py' first."
        )

    print("Loading augmented dataset...")
    df = pd.read_csv(csv_path)

    if df['timestamp'].dtype == object:
        df['timestamp'] = pd.to_datetime(df['timestamp'])

    print("Initializing FraudDetectionXGBoost modeler...")
    modeler = FraudDetectionXGBoost()

    print("Starting training...")
    modeler.train(df)
    modeler.save_model(model_path)
    print(f"Training complete. Model saved to '{model_path}'.")

if __name__ == '__main__':
    csv_main()
    main()

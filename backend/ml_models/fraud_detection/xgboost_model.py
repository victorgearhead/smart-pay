
import xgboost as xgb
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import json
import os

class FraudDetectionXGBoost:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_names = []
        
    def prepare_features(self, df):
        """Feature engineering for fraud detection"""
        
        df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
        df['day_of_week'] = pd.to_datetime(df['timestamp']).dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_night'] = ((df['hour'] < 6) | (df['hour'] > 22)).astype(int)
        
        df['amount_log'] = np.log1p(df['amount'])
        df['amount_zscore'] = (df['amount'] - df['amount'].mean()) / df['amount'].std()
        
        df['velocity_1h'] = df.groupby('userId')['amount'].transform(
            lambda x: x.rolling(window=10, min_periods=1).count()
        )
        df['velocity_amount_1h'] = df.groupby('userId')['amount'].transform(
            lambda x: x.rolling(window=10, min_periods=1).sum()
        )
        
        user_stats = df.groupby('userId').agg({
            'amount': ['mean', 'std', 'count'],
            'merchantCategory': lambda x: x.nunique()
        }).round(2)
        user_stats.columns = ['user_avg_amount', 'user_std_amount', 'user_tx_count', 'user_merchant_diversity']
        df = df.merge(user_stats, left_on='userId', right_index=True, how='left')
        
        merchant_stats = df.groupby('merchantCategory').agg({
            'amount': ['mean', 'count'],
            'isFraud': 'mean'
        }).round(4)
        merchant_stats.columns = ['merchant_avg_amount', 'merchant_tx_count', 'merchant_fraud_rate']
        df = df.merge(merchant_stats, left_on='merchantCategory', right_index=True, how='left')
        
        return df
    
    def encode_categorical_features(self, df, fit=True):
        """Encode categorical features"""
        categorical_cols = ['merchantCategory', 'location', 'deviceInfo']
        
        for col in categorical_cols:
            if col in df.columns:
                if fit:
                    le = LabelEncoder()
                    df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
                    self.label_encoders[col] = le
                else:
                    if col in self.label_encoders:
                        df[f'{col}_encoded'] = df[col].astype(str).map(
                            lambda x: self.label_encoders[col].transform([x])[0] 
                            if x in self.label_encoders[col].classes_ else -1
                        )
                    else:
                        df[f'{col}_encoded'] = -1
        
        return df
    
    def train(self, df):
        """Train XGBoost model"""
        print("Preparing features...")
        df = self.prepare_features(df)
        df = self.encode_categorical_features(df, fit=True)
        
        feature_cols = [
            'amount', 'amount_log', 'amount_zscore',
            'hour', 'day_of_week', 'is_weekend', 'is_night',
            'velocity_1h', 'velocity_amount_1h',
            'user_avg_amount', 'user_std_amount', 'user_tx_count', 'user_merchant_diversity',
            'merchant_avg_amount', 'merchant_tx_count', 'merchant_fraud_rate',
            'merchantCategory_encoded', 'location_encoded', 'deviceInfo_encoded',
            'previousDeclines', 'velocityLastHour'
        ]
        
        available_features = [col for col in feature_cols if col in df.columns]
        self.feature_names = available_features
        
        X = df[available_features].fillna(0)
        y = df['isFraud']
        
        X_scaled = self.scaler.fit_transform(X)
        
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training on {len(X_train)} samples with {len(available_features)} features")
        
        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            use_label_encoder=False
        )

        self.model.fit(
            X_train,
            y_train,
            verbose=True
        )
        \
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        
        print("\nModel Performance:")
        print(classification_report(y_test, y_pred))
        print(f"ROC AUC: {roc_auc_score(y_test, y_pred_proba):.4f}")
        
        return self.model
    
    def predict(self, features):
        """Predict fraud probability"""
        if self.model is None:
            raise ValueError("Model not trained yet")
            
        if isinstance(features, dict):
            df = pd.DataFrame([features])
        else:
            df = features.copy()
            
        df = self.prepare_features(df)
        df = self.encode_categorical_features(df, fit=False)
        
        X = df[self.feature_names].fillna(0)
        X_scaled = self.scaler.transform(X)
        
        probabilities = self.model.predict_proba(X_scaled)[:, 1]
        return probabilities[0] if len(probabilities) == 1 else probabilities
    
    def save_model(self, path):
        """Save model and encoders"""
        model_data = {
            'model': self.model,
            'label_encoders': self.label_encoders,
            'scaler': self.scaler,
            'feature_names': self.feature_names
        }
        joblib.dump(model_data, path)
        print(f"Model saved to {path}")
    
    def load_model(self, path):
        """Load model and encoders"""
        model_data = joblib.load(path)
        self.model = model_data['model']
        self.label_encoders = model_data['label_encoders']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        print(f"Model loaded from {path}")

from flask import Flask, request, jsonify

app = Flask(__name__)
fraud_model = FraudDetectionXGBoost()

@app.route('/fraud-xgboost-endpoint-local/ping', methods=['GET'])
def ping():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

@app.route('/fraud-xgboost-endpoint-local/invocations', methods=['POST'])
def predict():
    """Prediction endpoint"""
    try:
        data = request.get_json()
        
        if 'instances' in data:
            predictions = []
            for instance in data['instances']:
                prob = fraud_model.predict(instance)
                predictions.append({'score': float(prob)})
            return jsonify({'predictions': predictions})
        else:
            prob = fraud_model.predict(data)
            return jsonify({'score': float(prob)})
            
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    model_path = os.environ.get('ml_models/fraud_detection', './fraud_model.joblib')
    if os.path.exists(model_path):
        fraud_model.load_model(model_path)
    
    app.run(host='0.0.0.0', port=8080)

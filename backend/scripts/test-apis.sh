
#!/bin/bash

set -e

BASE_URL="http://localhost:3001"

echo "🧪 Testing SmartPay Orchestrator APIs"

# Test health endpoint
echo "🔍 Testing health endpoint..."
curl -X GET "$BASE_URL/health" | jq '.'

echo ""
echo "🔍 Testing fraud detection API..."
curl -X POST "$BASE_URL/api/fraud" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-jwt-token" \
  -d '{
    "userId": "user_123",
    "cardId": "card_4242424242424242",
    "amount": 1500,
    "merchantCategory": "online_retail",
    "location": "San Francisco, CA",
    "deviceInfo": "Chrome/Mac",
    "transactionId": "tx_test_001",
    "previousDeclines": 0,
    "velocityLastHour": 2
  }' | jq '.'

echo ""
echo "🔍 Testing payment processing API..."
curl -X POST "$BASE_URL/api/payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-jwt-token" \
  -d '{
    "userId": "user_123",
    "amount": 1500,
    "currency": "USD",
    "gateway": "stripe",
    "paymentMethod": "card",
    "userEmail": "test@example.com"
  }' | jq '.'

echo ""
echo "🔍 Testing rewards API..."
curl -X POST "$BASE_URL/api/rewards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-jwt-token" \
  -d '{
    "userId": "user_123",
    "transactionId": "tx_test_001",
    "amount": 1500,
    "currency": "USD",
    "userTier": "premium"
  }' | jq '.'

echo ""
echo "🔍 Testing ML endpoints..."
curl -X POST "$BASE_URL/ml/fraud/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500,
    "merchant_category": "online_retail"
  }' | jq '.'

curl -X POST "$BASE_URL/ml/routing/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "context_features": {
      "amount_log": 7.31,
      "risk_score": 0.15,
      "merchant_type": "online_retail"
    }
  }' | jq '.'

echo ""
echo "✅ All API tests completed!"


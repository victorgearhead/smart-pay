
# SmartPay Orchestrator - Local Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git
- jq (for testing scripts) - `brew install jq` on macOS

### 1. Setup and Start Services

```bash
# Clone and navigate to backend
cd backend

# Run the setup script (this will handle everything)
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
```

### 2. Configure API Keys (Optional for basic testing)

Edit `.env` file and add your API keys:

```bash
# Required for real payment processing
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_TEST_KEY
OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY

# Required for Solana rewards (generate with solana-keygen)
MINT_AUTHORITY_SECRET_KEY=[1,2,3,4,5...] # Your keypair array
SOLANA_PAYER_SECRET_KEY=[1,2,3,4,5...]   # Your keypair array
```

### 3. Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 4. Test the APIs

```bash
# Test all endpoints
chmod +x scripts/test-apis.sh
./scripts/test-apis.sh
```

## 📊 Available Services

### Backend API Endpoints
- **Health Check**: `GET http://localhost:3001/health`
- **Fraud Detection**: `POST http://localhost:3001/api/fraud`
- **Payment Processing**: `POST http://localhost:3001/api/payment`
- **Rewards Minting**: `POST http://localhost:3001/api/rewards`

### ML Model Endpoints (Mock)
- **Fraud Prediction**: `POST http://localhost:3001/ml/fraud/predict`
- **Payment Routing**: `POST http://localhost:3001/ml/routing/predict`

### Infrastructure Services
- **OpenSearch**: `http://localhost:9200`
- **OpenSearch Dashboards**: `http://localhost:5601`
- **Redis**: `localhost:6379`
- **LocalStack (AWS Mock)**: `http://localhost:4566`

## 🧪 Testing Examples

### Fraud Detection Test
```bash
curl -X POST http://localhost:3001/api/fraud \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-jwt-token" \
  -d '{
    "userId": "user_123",
    "cardId": "card_4242424242424242",
    "amount": 1500,
    "merchantCategory": "online_retail",
    "location": "San Francisco, CA",
    "deviceInfo": "Chrome/Mac",
    "transactionId": "tx_test_001"
  }'
```

### Payment Processing Test
```bash
curl -X POST http://localhost:3001/api/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-jwt-token" \
  -d '{
    "userId": "user_123",
    "amount": 1500,
    "currency": "USD",
    "gateway": "stripe",
    "paymentMethod": "card",
    "userEmail": "test@example.com"
  }'
```

### Rewards Test
```bash
curl -X POST http://localhost:3001/api/rewards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-jwt-token" \
  -d '{
    "userId": "user_123",
    "transactionId": "tx_test_001",
    "amount": 1500,
    "currency": "USD",
    "userTier": "premium"
  }'
```

## 🔧 Configuration

### Environment Variables (`.env`)
- `NODE_ENV=development` - Enables mock services
- `USE_MOCK_SERVICES=true` - Forces mock mode even in production
- `MOCK_SAGEMAKER=true` - Use mock ML models
- `MOCK_PAYMENTS=true` - Use mock payment gateways

### Docker Services
- **LocalStack**: Mock AWS services (S3, DynamoDB, Lambda, SageMaker)
- **Redis**: Caching layer for fraud scores and session data
- **OpenSearch**: Document store for RAG and analytics

## 🚦 Service Status Check

```bash
# Check all services
docker-compose ps

# Check individual service logs
docker-compose logs redis
docker-compose logs opensearch
docker-compose logs localstack
```

## 🔄 Development Workflow

1. **Start Services**: `./scripts/setup-local.sh`
2. **Start Backend**: `npm run dev`
3. **Test APIs**: `./scripts/test-apis.sh`
4. **View Logs**: Check console output
5. **Monitor**: Use OpenSearch Dashboards at `http://localhost:5601`

## 🛠️ Troubleshooting

### Common Issues

**Docker services not starting:**
```bash
docker-compose down
docker-compose up -d
```

**Port conflicts:**
```bash
# Kill processes using required ports
lsof -ti:3001,4566,6379,9200,5601 | xargs kill -9
```

**Reset everything:**
```bash
# Stop and remove all containers and volumes
docker-compose down -v
./scripts/setup-local.sh
```

### Getting Real API Keys

1. **Stripe**: Get test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Solana**: Generate keypairs with `solana-keygen new`

## 📈 Next Steps

1. **Frontend Integration**: Start the React frontend (`cd .. && npm run dev`)
2. **Real Payment Testing**: Add real Stripe test keys
3. **ML Model Training**: Use the provided training scripts
4. **AWS Deployment**: Use the production deployment scripts

## 🆘 Support

- Check logs: `npm run dev` (console output)
- Service status: `docker-compose ps`
- API testing: `./scripts/test-apis.sh`
- Reset setup: `./scripts/setup-local.sh`

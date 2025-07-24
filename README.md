
# SmartPay Orchestrator Backend

A comprehensive payment orchestration platform with AI-powered fraud detection, smart routing, blockchain rewards, and conversational analytics.

## 🏗️ Architecture

- **API Layer**: AWS API Gateway + Lambda Functions (LocalStack)
- **Authentication**: AWS Cognito with JWT tokens (LocalStack)
- **ML Models**: AWS SageMaker endpoints for fraud detection and routing optimization (LocalStack)
- **Search & Chat**: OpenSearch + RAG pipeline with OpenAI/Bedrock (LocalStack)
- **Event-Driven**: EventBridge for decoupled workflows
- **Infrastructure**: Terraform + AWS SAM for IaC (LocalStack)

## 🚀 Features

### Core Services
- **Fraud Detection**: XGBoost + Graph Neural Networks for real-time risk assessment
- **Payment Routing**: Contextual bandits for optimal gateway selection (Stripe, AmazonPay, Solana)
- **AI Assistant**: RAG-powered chat for payment analytics

### API Endpoints
- `POST /fraud` - Real-time fraud analysis
- `POST /route` - Smart payment routing
- `POST /pay` - Payment processing orchestration
- `POST /chat` - AI-powered analytics chat

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18+
- AWS CLI configured or LocalStack
- AWS SAM CLI or LocalStack
- Docker (for local testing)

### Environment Variables
```bash
AWS_REGION=us-east-1
FRAUD_ENDPOINT_NAME=fraud-detection-endpoint
ROUTING_ENDPOINT_NAME=routing-bandit-endpoint

STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
OPENSEARCH_ENDPOINT=https://search-...
```

### Local Development
```bash
npm install

npm test

npm run build

sam local start-api --port 3001

sam build && sam deploy --guided

(if localstack please use docker run)
```
## 🚢 Deployment

## 🤖 ML Models

### Fraud Detection
- **XGBoost**: Gradient boosting for transaction features

### Payment Routing
- **Contextual Bandits**: Multi-armed bandit optimization
- **Features**: Amount, risk, merchant type, region

### Scaling
- Auto-scaling Lambda functions (LocalStack)
- DynamoDB on-demand billing (LocalStack)
- ElastiCache for hot data
- CDN for static assets

## 🐛 Troubleshooting

### Common Issues and Future Builds
1. **SageMaker Timeout**: Check endpoint status and scaling
2. **Cognito Auth**: Verify JWT token expiration
3. **Solana RPC**: Network congestion or endpoint limits
4. **OpenSearch**: Index refresh intervals
5. **Reward System**: Propoased Reward system involves recommendation systems and crypto exchanges

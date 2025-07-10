
# SmartPay Orchestrator Backend

A comprehensive payment orchestration platform with AI-powered fraud detection, smart routing, blockchain rewards, and conversational analytics.

## 🏗️ Architecture

- **API Layer**: AWS API Gateway + Lambda Functions
- **Authentication**: AWS Cognito with JWT tokens
- **ML Models**: AWS SageMaker endpoints for fraud detection and routing optimization
- **Blockchain**: Solana integration for SPL token rewards
- **Search & Chat**: OpenSearch + RAG pipeline with OpenAI/Bedrock
- **Event-Driven**: EventBridge for decoupled workflows
- **Infrastructure**: Terraform + AWS SAM for IaC

## 🚀 Features

### Core Services
- **Fraud Detection**: XGBoost + Graph Neural Networks for real-time risk assessment
- **Payment Routing**: Contextual bandits for optimal gateway selection (Stripe, AmazonPay, Solana)
- **Blockchain Rewards**: Automated SPL token minting on Solana
- **AI Assistant**: RAG-powered chat for payment analytics

### API Endpoints
- `POST /fraud` - Real-time fraud analysis
- `POST /route` - Smart payment routing
- `POST /pay` - Payment processing orchestration
- `POST /reward` - Blockchain reward distribution
- `POST /chat` - AI-powered analytics chat

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18+
- AWS CLI configured
- AWS SAM CLI
- Docker (for local testing)

### Environment Variables
```bash
# AWS Configuration
AWS_REGION=us-east-1
FRAUD_ENDPOINT_NAME=fraud-detection-endpoint
ROUTING_ENDPOINT_NAME=routing-bandit-endpoint

# External Services
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
OPENSEARCH_ENDPOINT=https://search-...

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SPL_TOKEN_MINT_ADDRESS=...
MINT_AUTHORITY_SECRET_KEY=...
DEFAULT_USER_WALLET=...
SOLANA_TREASURY_WALLET=...
```

### Local Development
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build TypeScript
npm run build

# Start local API
sam local start-api --port 3001

# Deploy to AWS
sam build && sam deploy --guided
```

### Testing
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Load testing
npm run test:load

# Coverage report
npm run test:coverage
```
## 🚢 Deployment

### CI/CD Pipeline
- **Development**: Auto-deploy on `develop` branch
- **Production**: Manual approval for `main` branch
- **Testing**: Automated test suite on all PRs
- **Infrastructure**: Terraform for AWS resources

### Environments
- **dev**: Development environment
- **staging**: Pre-production testing
- **prod**: Production environment

## 🤖 ML Models

### Fraud Detection
- **XGBoost**: Gradient boosting for transaction features

### Payment Routing
- **Contextual Bandits**: Multi-armed bandit optimization
- **Features**: Amount, risk, merchant type, region
- **Rewards**: Success rate, cost optimization

### Scaling
- Auto-scaling Lambda functions
- DynamoDB on-demand billing
- ElastiCache for hot data
- CDN for static assets

## 🐛 Troubleshooting

### Common Issues
1. **SageMaker Timeout**: Check endpoint status and scaling
2. **Cognito Auth**: Verify JWT token expiration
3. **Solana RPC**: Network congestion or endpoint limits
4. **OpenSearch**: Index refresh intervals


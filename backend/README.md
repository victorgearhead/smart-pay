
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
AWS_REGION=us-east-1
FRAUD_ENDPOINT_NAME=fraud-detection-endpoint
ROUTING_ENDPOINT_NAME=routing-bandit-endpoint

STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
OPENSEARCH_ENDPOINT=https://search-...

SOLANA_RPC_URL=https://api.devnet.solana.com
SPL_TOKEN_MINT_ADDRESS=...
MINT_AUTHORITY_SECRET_KEY=...
DEFAULT_USER_WALLET=...
SOLANA_TREASURY_WALLET=...
```

### Local Development
```bash
npm install

npm test

npm run build

sam local start-api --port 3001

sam build && sam deploy --guided
```

### Testing
```bash
npm test

npm run test:integration

npm run test:load

npm run test:coverage
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── handlers/          # Lambda function handlers
│   ├── services/          # Business logic services
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── __tests__/        # Test files
├── infra/                # Terraform infrastructure
├── .github/workflows/    # CI/CD pipelines
├── template.yaml         # AWS SAM template
└── package.json         # Dependencies & scripts
```

## 🔐 Security

- JWT authentication on all endpoints
- AWS Cognito user management
- Secrets stored in AWS Secrets Manager
- TLS 1.3 for all communications
- IAM least-privilege access
- Input validation and sanitization

## 📊 Monitoring

- CloudWatch Logs & Metrics
- X-Ray distributed tracing
- Custom dashboards for business metrics
- Automated alerts for SLA breaches
- Performance monitoring for ML models

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
- **GraphSAGE**: Graph neural network for user behavior
- **Ensemble**: Combined model scoring

### Payment Routing
- **Contextual Bandits**: Multi-armed bandit optimization
- **Features**: Amount, risk, merchant type, region
- **Rewards**: Success rate, cost optimization

## 🔗 Blockchain Integration

### Solana SPL Tokens
- **Network**: Devnet (configurable)
- **Rewards**: 2% of transaction amount
- **Range**: 1-1000 tokens per transaction
- **Wallet**: Phantom/Solflare support

### Smart Contracts
- Token minting program
- Reward distribution logic
- Meta-transaction support

## 📈 Performance

### SLA Targets
- **Latency**: < 200ms p95
- **Availability**: 99.9% uptime
- **Error Rate**: < 0.1% 5xx errors
- **ML Inference**: < 50ms fraud detection

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

### Debug Mode
```bash
export DEBUG=smartpay:*
export LOG_LEVEL=debug

aws logs tail /aws/lambda/smartpay-fraud-function --follow
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Discord**: [SmartPay Community](https://discord.gg/smartpay)
- **Email**: support@smartpay.dev

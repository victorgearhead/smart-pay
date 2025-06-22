
# SmartPay Orchestrator - System Architecture

## Overview

SmartPay Orchestrator is a production-ready payment orchestration platform that combines AI-powered fraud detection, intelligent routing, blockchain rewards, and conversational support.

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        React[React Dashboard]
        Mobile[Mobile Apps]
        External[External APIs]
    end
    
    subgraph "API Gateway"
        APIGW[API Gateway]
        WSS[WebSocket API]
        WAF[WAF Protection]
    end
    
    subgraph "Authentication"
        Cognito[AWS Cognito]
        JWT[JWT Validation]
    end
    
    subgraph "Core Services"
        Fraud[Fraud Detection λ]
        Routing[Smart Routing λ]
        Payment[Payment Processing λ]
        Rewards[Rewards System λ]
        Chat[AI Chat λ]
        WS[WebSocket Handler λ]
    end
    
    subgraph "AI/ML Layer"
        SageMaker[SageMaker Endpoints]
        OpenAI[OpenAI API]
        OpenSearch[OpenSearch RAG]
    end
    
    subgraph "Payment Gateways"
        Stripe[Stripe]
        Amazon[Amazon Pay]
        Solana[Solana Network]
    end
    
    subgraph "Data Layer"
        DDB[DynamoDB Tables]
        Redis[ElastiCache Redis]
        S3[S3 Storage]
    end
    
    subgraph "Event Processing"
        EventBridge[EventBridge]
        Publisher[Event Publisher λ]
        DLQ[Dead Letter Queue]
    end
    
    subgraph "Monitoring"
        CloudWatch[CloudWatch]
        XRay[X-Ray Tracing]
        Alarms[CloudWatch Alarms]
        SNS[SNS Alerts]
    end
    
    React --> WAF
    Mobile --> WAF
    External --> WAF
    WAF --> APIGW
    APIGW --> Cognito
    Cognito --> JWT
    
    APIGW --> Fraud
    APIGW --> Routing
    APIGW --> Payment
    APIGW --> Rewards
    APIGW --> Chat
    
    WSS --> WS
    WS --> DDB
    
    Fraud --> SageMaker
    Fraud --> Redis
    Routing --> SageMaker
    Payment --> Stripe
    Payment --> Amazon
    Payment --> Solana
    Chat --> OpenAI
    Chat --> OpenSearch
    
    Fraud --> EventBridge
    Payment --> EventBridge
    Rewards --> EventBridge
    EventBridge --> Publisher
    Publisher --> WSS
    
    Fraud --> DDB
    Routing --> DDB
    Payment --> DDB
    Rewards --> DDB
    Chat --> DDB
    
    Fraud --> CloudWatch
    Routing --> CloudWatch
    Payment --> CloudWatch
    CloudWatch --> Alarms
    Alarms --> SNS
```

## Data Flow - Transaction Processing

```mermaid
sequenceDiagram
    participant Client
    participant APIGW as API Gateway
    participant Fraud as Fraud Detection
    participant Cache as Redis Cache
    participant Route as Smart Routing
    participant Pay as Payment Service
    participant Reward as Reward Service
    participant Event as EventBridge
    participant WS as WebSocket
    
    Client->>APIGW: POST /pay (transaction)
    APIGW->>Fraud: Analyze risk
    Fraud->>Cache: Check cached risk score
    Cache-->>Fraud: Cache miss
    Fraud->>Fraud: ML inference
    Fraud->>Cache: Store risk score
    Fraud-->>APIGW: Risk score: 0.23
    
    APIGW->>Route: Find optimal gateway
    Route->>Cache: Check cached routing
    Route->>Route: Contextual bandit decision
    Route-->>APIGW: Gateway: Stripe
    
    APIGW->>Pay: Process payment
    Pay->>Pay: Stripe API call
    Pay-->>APIGW: Payment success
    
    APIGW->>Reward: Mint tokens
    Reward->>Reward: Solana transaction
    Reward-->>APIGW: Tokens minted
    
    APIGW->>Event: Publish PaymentProcessed
    Event->>WS: Broadcast to clients
    WS->>Client: Real-time update
    
    APIGW-->>Client: Complete response
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        WAF[AWS WAF]
        Cognito[User Authentication]
        IAM[IAM Roles & Policies]
        VPC[Private VPC]
        KMS[AWS KMS Encryption]
        SM[Secrets Manager]
    end
    
    subgraph "Data Protection"
        Transit[TLS 1.3 in Transit]
        Rest[AES-256 at Rest]
        TokenEnc[JWT Token Encryption]
        DBEnc[DynamoDB Encryption]
    end
    
    subgraph "Network Security"
        SG[Security Groups]
        NACL[Network ACLs]
        PrivSub[Private Subnets]
        NAT[NAT Gateway]
    end
    
    WAF --> Cognito
    Cognito --> IAM
    IAM --> VPC
    VPC --> SG
    SG --> PrivSub
    
    KMS --> Rest
    KMS --> DBEnc
    SM --> TokenEnc
```

## Key Components

### 1. Fraud Detection Service
- **Purpose**: Real-time transaction risk assessment
- **Technology**: SageMaker ML endpoint, Redis caching
- **Performance**: <200ms response time, 99.9% availability
- **Scaling**: Auto-scaling based on request volume

### 2. Smart Routing Service
- **Purpose**: Contextual bandit optimization for payment gateways
- **Algorithm**: Multi-armed bandit with context
- **Factors**: Cost, latency, success rate, risk score
- **Caching**: 15-minute TTL for routing decisions

### 3. Payment Processing Service
- **Gateways**: Stripe, Amazon Pay, Solana
- **Features**: Retry logic, circuit breakers, dead letter queues
- **Monitoring**: Real-time success rates and latency tracking

### 4. Blockchain Rewards System
- **Network**: Solana (Devnet/Mainnet)
- **Token**: SPL Token (SmartReward)
- **Features**: Automatic minting, balance tracking, escrow

### 5. AI Assistant (RAG)
- **Technology**: OpenAI GPT + OpenSearch vector store
- **Knowledge Base**: Transaction logs, FAQs, user guides
- **Features**: Context-aware responses, session management

## Performance Specifications

| Component | Latency Target | Throughput | Availability |
|-----------|---------------|------------|--------------|
| Fraud Detection | <200ms | 1000 RPS | 99.9% |
| Smart Routing | <100ms | 1000 RPS | 99.9% |
| Payment Processing | <5s | 500 RPS | 99.95% |
| AI Chat | <3s | 100 RPS | 99.9% |
| WebSocket Events | <50ms | 10k connections | 99.9% |

## Cost Optimization

### Caching Strategy
- Risk scores: 30-minute TTL
- Routing decisions: 15-minute TTL
- User token balances: 5-minute TTL
- Chat responses: 1-hour TTL

### Auto-scaling Policies
- Lambda: Concurrent execution limits
- DynamoDB: On-demand billing
- ElastiCache: Single-node for dev, cluster for prod
- SageMaker: Auto-scaling endpoints

## Disaster Recovery

### Backup Strategy
- DynamoDB: Point-in-time recovery enabled
- Secrets: Cross-region replication
- Logs: 30-day retention in CloudWatch

### Monitoring & Alerting
- Error rate >1%: Immediate alert
- Latency >2s: Warning alert
- SageMaker endpoint down: Critical alert
- Failed payments >5%: Critical alert

## Development Workflow

### Local Development
```bash
# Start local services
npm run dev:local

# Run tests
npm test

# Load testing
npm run load-test
```

### Deployment Pipeline
1. **Dev**: Automatic deployment on feature branch push
2. **Staging**: Manual promotion from dev
3. **Production**: Manual promotion with approval

### Environment Variables
- **Dev**: Basic monitoring, test data
- **Staging**: Full monitoring, synthetic data
- **Production**: Enterprise monitoring, real data

## API Documentation

Full OpenAPI specification available at `/docs/openapi.yaml`

### Core Endpoints
- `POST /fraud` - Risk assessment
- `POST /route` - Gateway selection
- `POST /pay` - Payment processing
- `POST /reward` - Token minting
- `POST /chat` - AI assistant

### WebSocket Events
- `payment_processed` - Real-time payment updates
- `reward_minted` - Token minting notifications
- `fraud_detected` - Security alerts

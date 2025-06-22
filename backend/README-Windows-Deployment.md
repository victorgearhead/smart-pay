
# SmartPay Orchestrator - Windows Local Deployment Guide

## 🚀 Quick Start for Windows

### Prerequisites
- **Docker Desktop for Windows** (with WSL2 backend enabled)
- **Node.js 18+** and **npm**
- **Git for Windows**
- **Windows Terminal** (recommended) or PowerShell
- **curl** (available in Windows 10+ by default)

### 1. Setup and Start Services (Windows)

```powershell
# Clone and navigate to backend
cd backend

# Run the Windows setup script
.\scripts\setup-windows.bat
```

### 2. Manual Setup (if script fails)

```powershell
# Copy environment file
copy .env.local .env

# Install dependencies
npm install

# Start Docker services
docker-compose up -d

# Wait for services (check manually)
docker-compose ps

# Build TypeScript
npm run build

# Start the server
npm run dev
```

### 3. Configure API Keys (Optional for basic testing)

Edit `.env` file and add your API keys:

```bash
# Required for real payment processing
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_TEST_KEY
OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY

# Required for Solana rewards (generate with solana-keygen)
MINT_AUTHORITY_SECRET_KEY=[1,2,3,4,5...] # Your keypair array
SOLANA_PAYER_SECRET_KEY=[1,2,3,4,5...]   # Your keypair array
```

### 4. Test the APIs (Windows)

```powershell
# Test all endpoints using Windows batch script
.\scripts\test-apis.bat
```

## 📊 Available Services

### Backend API Endpoints
- **Health Check**: `GET http://localhost:3001/health`
- **Fraud Detection**: `POST http://localhost:3001/api/fraud`
- **Payment Processing**: `POST http://localhost:3001/api/payment`
- **Rewards Minting**: `POST http://localhost:3001/api/rewards`
- **Chat/RAG**: `POST http://localhost:3001/api/chat`

### ML Model Endpoints (Mock)
- **Fraud Prediction**: `POST http://localhost:3001/ml/fraud/predict`
- **Payment Routing**: `POST http://localhost:3001/ml/routing/predict`

### Infrastructure Services
- **OpenSearch**: `http://localhost:9200`
- **OpenSearch Dashboards**: `http://localhost:5601`
- **Redis**: `localhost:6379`
- **LocalStack (AWS Mock)**: `http://localhost:4566`

## 🤖 RAG (Retrieval Augmented Generation) Setup

The RAG system is fully integrated and works with:

### Components:
1. **OpenSearch** - Document storage and vector search
2. **OpenAI GPT-3.5** - Language model for responses
3. **Knowledge Base** - Indexed SmartPay documentation
4. **Transaction History** - User-specific context

### RAG Features:
- **Contextual Responses** - AI assistant uses company knowledge
- **Transaction Context** - Answers based on user's payment history
- **Real-time Indexing** - New transactions are automatically indexed
- **Semantic Search** - Finds relevant information using vector similarity

### Testing RAG:
```powershell
# Test the AI assistant endpoint
curl -X POST http://localhost:3001/api/chat ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer mock-jwt-token" ^
  -d "{\"message\":\"Why was my payment declined?\",\"userId\":\"user_123\",\"sessionId\":\"session_123\"}"
```

## 🛠️ Windows-Specific Troubleshooting

### Docker Desktop Issues:
```powershell
# Restart Docker Desktop
# Or via command line:
& "C:\Program Files\Docker\Docker\Docker Desktop.exe" --quit
Start-Sleep -Seconds 5
& "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Port Conflicts (Windows):
```powershell
# Find processes using ports
netstat -ano | findstr "3001"
netstat -ano | findstr "4566"
netstat -ano | findstr "6379"
netstat -ano | findstr "9200"

# Kill process by PID (replace XXXX with actual PID)
taskkill /PID XXXX /F
```

### WSL2 Issues:
```powershell
# Check WSL2 status
wsl --status

# Restart WSL2 if needed
wsl --shutdown
wsl
```

### Reset Everything (Windows):
```powershell
# Stop and remove all containers and volumes
docker-compose down -v
docker system prune -f
.\scripts\setup-windows.bat
```

### Environment Variable Issues:
```powershell
# Check if environment variables are loaded
Get-Content .env
```

## 🧪 Complete Testing Workflow (Windows)

### 1. Health Check:
```powershell
curl http://localhost:3001/health
```

### 2. Infrastructure Check:
```powershell
# Redis
docker exec redis-smartpay redis-cli ping

# OpenSearch
curl http://localhost:9200/_cluster/health

# LocalStack
curl http://localhost:4566/health
```

### 3. API Testing:
```powershell
# Run all tests
.\scripts\test-apis.bat
```

### 4. RAG Testing:
```powershell
# Check OpenSearch indices
curl http://localhost:9200/_cat/indices

# Test knowledge search
curl -X POST http://localhost:9200/smartpay-knowledge/_search ^
  -H "Content-Type: application/json" ^
  -d "{\"query\":{\"match_all\":{}}}"
```

## 📈 Frontend Integration (Windows)

### Start Frontend:
```powershell
# In project root directory
npm install
npm run dev
```

### Access Application:
- **Frontend**: `http://localhost:8080` (or your Vite port)
- **Backend**: `http://localhost:3001`

## 🚀 Production Deployment Notes

### What Works Locally:
✅ **Mock ML Models** - XGBoost, Vowpal Wabbit, GNN, Anomaly Detection  
✅ **Mock Payment Gateways** - Stripe, Amazon Pay, Solana  
✅ **RAG System** - OpenSearch + OpenAI integration  
✅ **Real-time Updates** - WebSocket connections  
✅ **Caching Layer** - Redis for performance  
✅ **Event Processing** - LocalStack EventBridge  

### For Production (requires real services):
🔄 **Real AWS SageMaker** - Deploy actual ML models  
🔄 **Real Payment APIs** - Live Stripe, Amazon Pay keys  
🔄 **Production OpenSearch** - AWS OpenSearch Service  
🔄 **Solana Mainnet** - Real blockchain transactions  

## 🆘 Support & Debugging

### Logs and Monitoring:
```powershell
# Backend logs
npm run dev

# Docker service logs
docker-compose logs redis
docker-compose logs opensearch
docker-compose logs localstack

# Check all services
docker-compose ps
```

### Debug Mode:
Set `DEBUG=1` in `.env` for verbose logging.

### Common Windows Issues:
1. **Path Issues** - Use forward slashes or double backslashes
2. **Permission Issues** - Run PowerShell as Administrator
3. **Firewall Issues** - Allow Docker and Node.js through Windows Firewall
4. **Antivirus Issues** - Exclude project folder from real-time scanning

This setup provides a complete SmartPay development environment on Windows with full RAG capabilities and all services working locally! 🎉

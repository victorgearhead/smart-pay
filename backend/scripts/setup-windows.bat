
@echo off
echo Setting up SmartPay Orchestrator for Local Development on Windows

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker Compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

REM Copy environment file if it doesn't exist
if not exist .env (
    echo Copying local environment configuration...
    copy .env.local .env
) else (
    echo Using existing .env file
)

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

REM Start infrastructure services
echo Starting Docker infrastructure services...
docker-compose up -d

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 15 /nobreak

REM Check if LocalStack is ready
echo Checking LocalStack status...
:check_localstack
curl -s http://localhost:4566/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Waiting for LocalStack...
    timeout /t 2 /nobreak
    goto check_localstack
)
echo LocalStack is ready

REM Check if Redis is ready
echo Checking Redis status...
:check_redis
docker exec redis-smartpay redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo Waiting for Redis...
    timeout /t 2 /nobreak
    goto check_redis
)
echo Redis is ready

REM Check if OpenSearch is ready
echo Checking OpenSearch status...
:check_opensearch
curl -s http://localhost:9200/_cluster/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Waiting for OpenSearch...
    timeout /t 2 /nobreak
    goto check_opensearch
)
echo OpenSearch is ready

REM Initialize OpenSearch indices for RAG
echo Initializing OpenSearch indices for RAG...
curl -X PUT "localhost:9200/smartpay-knowledge" -H "Content-Type: application/json" -d "{"mappings":{"properties":{"title":{"type":"text"},"content":{"type":"text"},"category":{"type":"keyword"},"tags":{"type":"keyword"},"timestamp":{"type":"date"}}}}"
curl -X PUT "localhost:9200/smartpay-transactions" -H "Content-Type: application/json" -d "{"mappings":{"properties":{"transactionId":{"type":"keyword"},"userId":{"type":"keyword"},"amount":{"type":"float"},"currency":{"type":"keyword"},"gateway":{"type":"keyword"},"status":{"type":"keyword"},"errorMessage":{"type":"text"},"timestamp":{"type":"date"}}}}"

REM Build TypeScript
echo Building TypeScript...
npm run build

echo.
echo Local setup completed successfully!
echo.
echo Next steps:
echo 1. Update API keys in .env file:
echo    - STRIPE_SECRET_KEY (get from Stripe Dashboard)
echo.
echo 2. Start the development server:
echo    npm run dev
echo.
echo 3. Access the services:
echo    - Backend API: http://localhost:3001
echo    - Health Check: http://localhost:3001/health
echo    - OpenSearch: http://localhost:9200
echo    - OpenSearch Dashboards: http://localhost:5601
echo.
echo 4. Test the APIs using test-apis.bat
echo.
pause

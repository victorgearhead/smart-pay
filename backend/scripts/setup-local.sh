set -e

echo "🚀 Setting up SmartPay Orchestrator for Local Development"

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

if [ ! -f .env.local ]; then
    echo "📄 Copying local environment configuration..."
    cp .env.local .env
else
    echo "📄 Using existing .env file"
fi

echo "📦 Installing Node.js dependencies..."
npm install

echo "🐳 Starting Docker infrastructure services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🔍 Checking LocalStack status..."
until curl -s http://localhost:4566/health > /dev/null; do
    echo "Waiting for LocalStack..."
    sleep 2
done
echo "✅ LocalStack is ready"

echo "🔍 Checking Redis status..."
until docker exec redis-smartpay redis-cli ping > /dev/null 2>&1; do
    echo "Waiting for Redis..."
    sleep 2
done
echo "✅ Redis is ready"

echo "🔍 Checking OpenSearch status..."
until curl -s http://localhost:9200/_cluster/health > /dev/null; do
    echo "Waiting for OpenSearch..."
    sleep 2
done
echo "✅ OpenSearch is ready"

echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "🎉 Local setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update API keys in .env file:"
echo "   - STRIPE_SECRET_KEY (get from Stripe Dashboard)"
echo "   - OPENAI_API_KEY (get from OpenAI Dashboard)"
echo "   - SOLANA keypairs (generate with solana-keygen)"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Access the services:"
echo "   - Backend API: http://localhost:3001"
echo "   - Health Check: http://localhost:3001/health"
echo "   - OpenSearch: http://localhost:9200"
echo "   - OpenSearch Dashboards: http://localhost:5601"
echo ""
echo "4. Test the APIs:"
echo "   - POST http://localhost:3001/api/fraud"
echo "   - POST http://localhost:3001/api/payment" 
echo "   - POST http://localhost:3001/api/rewards"
echo ""


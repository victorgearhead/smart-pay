
#!/bin/bash

set -e

echo "🚀 Deploying SmartPay ML Models to SageMaker..."

# Set environment variables
export AWS_REGION=${AWS_REGION:-us-east-1}
export ENVIRONMENT=${ENVIRONMENT:-dev}

# Build Docker images
echo "📦 Building Docker images..."

# Fraud Detection XGBoost Model
docker build -f deployment/docker/fraud-detection.Dockerfile -t smartpay-fraud-detection:latest .

# Routing Vowpal Wabbit Model  
docker build -f deployment/docker/routing-bandit.Dockerfile -t smartpay-routing-bandit:latest .

# Tag images for ECR
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

docker tag smartpay-fraud-detection:latest ${ECR_REGISTRY}/smartpay-fraud-detection:latest
docker tag smartpay-routing-bandit:latest ${ECR_REGISTRY}/smartpay-routing-bandit:latest

# Create ECR repositories if they don't exist
aws ecr describe-repositories --repository-names smartpay-fraud-detection || \
    aws ecr create-repository --repository-name smartpay-fraud-detection

aws ecr describe-repositories --repository-names smartpay-routing-bandit || \
    aws ecr create-repository --repository-name smartpay-routing-bandit

# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Push images
echo "⬆️ Pushing images to ECR..."
docker push ${ECR_REGISTRY}/smartpay-fraud-detection:latest
docker push ${ECR_REGISTRY}/smartpay-routing-bandit:latest

# Create SageMaker models
echo "🤖 Creating SageMaker models..."

# Fraud Detection Model
aws sagemaker create-model \
    --model-name "smartpay-fraud-detection-${ENVIRONMENT}" \
    --primary-container Image="${ECR_REGISTRY}/smartpay-fraud-detection:latest" \
    --execution-role-arn "arn:aws:iam::${ACCOUNT_ID}:role/SageMakerExecutionRole" \
    --region ${AWS_REGION} || echo "Fraud model already exists"

# Routing Bandit Model
aws sagemaker create-model \
    --model-name "smartpay-routing-bandit-${ENVIRONMENT}" \
    --primary-container Image="${ECR_REGISTRY}/smartpay-routing-bandit:latest" \
    --execution-role-arn "arn:aws:iam::${ACCOUNT_ID}:role/SageMakerExecutionRole" \
    --region ${AWS_REGION} || echo "Routing model already exists"

# Create endpoint configurations
echo "⚙️ Creating endpoint configurations..."

aws sagemaker create-endpoint-config \
    --endpoint-config-name "smartpay-fraud-detection-config-${ENVIRONMENT}" \
    --production-variants VariantName=primary,ModelName="smartpay-fraud-detection-${ENVIRONMENT}",InitialInstanceCount=1,InstanceType=ml.t2.medium,InitialVariantWeight=1 \
    --region ${AWS_REGION} || echo "Fraud endpoint config already exists"

aws sagemaker create-endpoint-config \
    --endpoint-config-name "smartpay-routing-bandit-config-${ENVIRONMENT}" \
    --production-variants VariantName=primary,ModelName="smartpay-routing-bandit-${ENVIRONMENT}",InitialInstanceCount=1,InstanceType=ml.t2.medium,InitialVariantWeight=1 \
    --region ${AWS_REGION} || echo "Routing endpoint config already exists"

# Create endpoints
echo "🔗 Creating SageMaker endpoints..."

aws sagemaker create-endpoint \
    --endpoint-name "fraud-xgboost-endpoint-${ENVIRONMENT}" \
    --endpoint-config-name "smartpay-fraud-detection-config-${ENVIRONMENT}" \
    --region ${AWS_REGION} || echo "Fraud endpoint already exists"

aws sagemaker create-endpoint \
    --endpoint-name "routing-vw-bandit-endpoint-${ENVIRONMENT}" \
    --endpoint-config-name "smartpay-routing-bandit-config-${ENVIRONMENT}" \
    --region ${AWS_REGION} || echo "Routing endpoint already exists"

echo "✅ Model deployment completed!"
echo "⏳ Endpoints are being created. This may take 5-10 minutes."
echo "📊 Monitor progress at: https://console.aws.amazon.com/sagemaker/home?region=${AWS_REGION}#/endpoints"

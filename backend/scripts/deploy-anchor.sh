
#!/bin/bash

set -e

echo "⚓ Deploying SmartPay Rewards Anchor Program..."

# Navigate to anchor program directory
cd anchor_program

# Set Solana environment
export SOLANA_CLUSTER=${SOLANA_CLUSTER:-devnet}
solana config set --url ${SOLANA_CLUSTER}

# Generate new keypair if needed
if [ ! -f ~/.config/solana/id.json ]; then
    echo "🔑 Generating new Solana keypair..."
    solana-keygen new --no-bip39-passphrase --silent
fi

# Check balance and airdrop if needed (devnet only)
if [ "$SOLANA_CLUSTER" = "devnet" ]; then
    BALANCE=$(solana balance | awk '{print $1}')
    if (( $(echo "$BALANCE < 1" | bc -l) )); then
        echo "💰 Requesting SOL airdrop for deployment..."
        solana airdrop 2
        sleep 5
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the program
echo "🔨 Building Anchor program..."
anchor build

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/smartpay_rewards-keypair.json)
echo "🆔 Program ID: $PROGRAM_ID"

# Update program ID in lib.rs if different
sed -i "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" programs/smartpay-rewards/src/lib.rs

# Rebuild with correct program ID
anchor build

# Deploy the program
echo "🚀 Deploying to $SOLANA_CLUSTER..."
anchor deploy --provider.cluster $SOLANA_CLUSTER

# Run tests
echo "🧪 Running tests..."
anchor test --provider.cluster $SOLANA_CLUSTER --skip-local-validator

# Initialize the program
echo "🏁 Initializing SmartReward token..."
MINT_AUTHORITY=$(solana address)

npx ts-node scripts/initialize.ts --cluster $SOLANA_CLUSTER --mint-authority $MINT_AUTHORITY

echo "✅ Anchor program deployment completed!"
echo "🏆 SmartReward Token Program ID: $PROGRAM_ID"
echo "🔗 Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=$SOLANA_CLUSTER"

# Return to backend directory
cd ..

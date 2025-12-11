#!/bin/bash
# Deploy Migration Claim contracts to local testnet
#
# Prerequisites:
# - Foundry installed (forge, cast)
# - Node.js and yarn
# - Local testnet running on localhost:8545
#
# Usage:
#   ./scripts/deploy-local.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "Migration Claim Local Deployment"
echo "============================================"

# Check prerequisites
command -v forge >/dev/null 2>&1 || { echo "Error: Foundry not installed. Run: curl -L https://foundry.paradigm.xyz | bash"; exit 1; }
command -v cast >/dev/null 2>&1 || { echo "Error: cast not found"; exit 1; }

# Configuration
RPC_URL="${RPC_URL:-http://localhost:8545}"
PRIVATE_KEY="${PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"  # Anvil default key 0
TREASURY="${TREASURY:-0x70997970C51812dc3A010C7d01b50e0d17dc79C8}"  # Anvil default account 1

echo ""
echo "Configuration:"
echo "  RPC URL: $RPC_URL"
echo "  Treasury: $TREASURY"
echo ""

# Check if local node is running
if ! cast block-number --rpc-url "$RPC_URL" >/dev/null 2>&1; then
    echo "Error: Cannot connect to RPC at $RPC_URL"
    echo "Make sure your local testnet is running."
    exit 1
fi

cd "$CONTRACT_DIR"

# Step 1: Install Foundry dependencies
echo "Step 1: Installing Foundry dependencies..."
if [ ! -d "lib/forge-std" ]; then
    forge install foundry-rs/forge-std --no-commit
fi
if [ ! -d "lib/openzeppelin-contracts" ]; then
    forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit
fi
echo "✓ Dependencies installed"

# Step 2: Generate Merkle tree with test data
echo ""
echo "Step 2: Generating Merkle tree with test data..."
cd scripts

# Check if we have the required packages
if ! command -v npx >/dev/null 2>&1; then
    echo "Installing dependencies..."
    yarn add @openzeppelin/merkle-tree viem typescript ts-node @types/node
fi

# Generate the tree
npx ts-node generateMerkleTree.ts --test 2>/dev/null || {
    echo "Installing script dependencies..."
    yarn add @openzeppelin/merkle-tree viem typescript ts-node @types/node
    npx ts-node generateMerkleTree.ts --test
}

# Extract the Merkle root
MERKLE_ROOT=$(grep -o '"root": "[^"]*"' merkle-tree-test.json | cut -d'"' -f4)
TOTAL_ALLOCATED=$(grep -o '"totalValue": "[^"]*"' merkle-tree-test.json | cut -d'"' -f4)

echo "✓ Merkle tree generated"
echo "  Root: $MERKLE_ROOT"
echo "  Total: $TOTAL_ALLOCATED"

cd "$CONTRACT_DIR"

# Step 3: Build contracts
echo ""
echo "Step 3: Building contracts..."
forge build
echo "✓ Contracts built"

# Step 4: Deploy contracts
echo ""
echo "Step 4: Deploying contracts..."

# For now, use a placeholder vkey (will be replaced with real one after SP1 compilation)
SR25519_VKEY="0x0000000000000000000000000000000000000000000000000000000000000000"

# Deploy using forge script
MERKLE_ROOT="$MERKLE_ROOT" \
TOTAL_ALLOCATED="$TOTAL_ALLOCATED" \
SR25519_VKEY="$SR25519_VKEY" \
TREASURY_ADDRESS="$TREASURY" \
PRIVATE_KEY="$PRIVATE_KEY" \
forge script script/Deploy.s.sol:DeployMigrationClaim \
    --rpc-url "$RPC_URL" \
    --broadcast \
    -vvv

# Extract deployed addresses from broadcast log
BROADCAST_FILE=$(ls -t broadcast/Deploy.s.sol/*/run-latest.json 2>/dev/null | head -1)

if [ -f "$BROADCAST_FILE" ]; then
    TNT_ADDRESS=$(cat "$BROADCAST_FILE" | grep -A2 '"contractName": "TNT"' | grep '"contractAddress"' | head -1 | cut -d'"' -f4)
    MIGRATION_CLAIM_ADDRESS=$(cat "$BROADCAST_FILE" | grep -A2 '"contractName": "MigrationClaim"' | grep '"contractAddress"' | head -1 | cut -d'"' -f4)
fi

echo ""
echo "============================================"
echo "Deployment Complete!"
echo "============================================"
echo ""
echo "Contract Addresses:"
echo "  TNT Token: $TNT_ADDRESS"
echo "  MigrationClaim: $MIGRATION_CLAIM_ADDRESS"
echo "  Treasury: $TREASURY"
echo ""
echo "Merkle Tree:"
echo "  Root: $MERKLE_ROOT"
echo "  Test data file: scripts/merkle-tree-test.json"
echo ""
echo "Environment Variables (add to .env.local):"
echo "  VITE_MIGRATION_CLAIM_ADDRESS=$MIGRATION_CLAIM_ADDRESS"
echo "  VITE_TNT_TOKEN_ADDRESS=$TNT_ADDRESS"
echo "  VITE_MIGRATION_MERKLE_TREE_URL=/data/migration-merkle-tree.json"
echo ""
echo "To copy the merkle tree data to the frontend:"
echo "  cp scripts/merkle-tree-test.json ../../apps/tangle-dapp/public/data/migration-merkle-tree.json"
echo ""

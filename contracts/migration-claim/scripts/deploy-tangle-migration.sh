#!/bin/bash
# Deploy Tangle Migration contracts to local testnet or Base Sepolia
#
# This deploys:
# 1. TNT Token (ERC20)
# 2. ZK Verifier (Mock for testing, SP1 for production)
# 3. TangleMigration contract (with merkle root and funding)
#
# Prerequisites:
# - Foundry installed
# - Local testnet running (or Base Sepolia RPC URL)
# - Migration output files in /Users/drew/webb/tangle/types/migration_output/
#
# Usage:
#   ./scripts/deploy-tangle-migration.sh              # Local testnet with mock verifier
#   ./scripts/deploy-tangle-migration.sh --production # Base Sepolia with SP1 verifier

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATION_OUTPUT="/Users/drew/webb/tangle/types/migration_output"

# Check for production flag
PRODUCTION=false
if [[ "$1" == "--production" ]]; then
    PRODUCTION=true
fi

echo "============================================"
echo "Tangle Migration Deployment"
echo "============================================"

# Check prerequisites
command -v forge >/dev/null 2>&1 || { echo "Error: Foundry not installed"; exit 1; }

# Configuration
if [ "$PRODUCTION" = true ]; then
    RPC_URL="${RPC_URL:-https://sepolia.base.org}"
    USE_MOCK_VERIFIER=false
    echo "Mode: PRODUCTION (Base Sepolia)"
else
    RPC_URL="${RPC_URL:-http://localhost:8545}"
    USE_MOCK_VERIFIER=true
    echo "Mode: LOCAL TESTING (Mock Verifier)"
fi

PRIVATE_KEY="${PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"

echo ""
echo "Configuration:"
echo "  RPC URL: $RPC_URL"
echo "  Migration Output: $MIGRATION_OUTPUT"
echo ""

# Check RPC connection
if ! cast block-number --rpc-url "$RPC_URL" >/dev/null 2>&1; then
    echo "Error: Cannot connect to RPC at $RPC_URL"
    exit 1
fi

# Read merkle root from the generated tree
if [ -f "$MIGRATION_OUTPUT/merkle-tree.json" ]; then
    MERKLE_ROOT=$(grep -o '"0x[a-fA-F0-9]\{64\}"' "$MIGRATION_OUTPUT/merkle-tree.json" | head -1 | tr -d '"')
    echo "Merkle Root: $MERKLE_ROOT"
else
    echo "Error: merkle-tree.json not found at $MIGRATION_OUTPUT"
    echo "Please run the migration snapshot generator first."
    exit 1
fi

cd "$CONTRACT_DIR"

# Install dependencies if needed
if [ ! -d "lib/forge-std" ]; then
    echo ""
    echo "Installing Foundry dependencies..."
    forge install foundry-rs/forge-std --no-commit
    forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit
fi

# Build contracts
echo ""
echo "Building contracts..."
forge build

# Deploy
echo ""
echo "Deploying contracts..."

MERKLE_ROOT="$MERKLE_ROOT" \
USE_MOCK_VERIFIER="$USE_MOCK_VERIFIER" \
PRIVATE_KEY="$PRIVATE_KEY" \
forge script script/DeployTangleMigration.s.sol:DeployTangleMigration \
    --rpc-url "$RPC_URL" \
    --broadcast \
    -vvv

# Extract deployed addresses
BROADCAST_FILE=$(ls -t broadcast/DeployTangleMigration.s.sol/*/run-latest.json 2>/dev/null | head -1)

if [ -f "$BROADCAST_FILE" ]; then
    TNT_ADDRESS=$(grep -o '"contractName": "TNT"' -A5 "$BROADCAST_FILE" | grep '"contractAddress"' | head -1 | grep -o '0x[a-fA-F0-9]\{40\}')
    MIGRATION_ADDRESS=$(grep -o '"contractName": "TangleMigration"' -A5 "$BROADCAST_FILE" | grep '"contractAddress"' | head -1 | grep -o '0x[a-fA-F0-9]\{40\}')
    VERIFIER_ADDRESS=$(grep -o '"contractName": "MockZKVerifier\|SP1ZKVerifier"' -A5 "$BROADCAST_FILE" | grep '"contractAddress"' | head -1 | grep -o '0x[a-fA-F0-9]\{40\}')
fi

echo ""
echo "============================================"
echo "Deployment Complete!"
echo "============================================"
echo ""
echo "Contract Addresses:"
echo "  TNT Token: $TNT_ADDRESS"
echo "  TangleMigration: $MIGRATION_ADDRESS"
echo "  ZK Verifier: $VERIFIER_ADDRESS"
echo ""
echo "Merkle Root: $MERKLE_ROOT"
echo ""
echo "Frontend Environment Variables (.env.local):"
echo "  VITE_TNT_TOKEN_ADDRESS=$TNT_ADDRESS"
echo "  VITE_TANGLE_MIGRATION_ADDRESS=$MIGRATION_ADDRESS"
echo "  VITE_ZK_VERIFIER_ADDRESS=$VERIFIER_ADDRESS"
echo "  VITE_MIGRATION_MERKLE_ROOT=$MERKLE_ROOT"
echo ""
echo "Next Steps:"
echo "  1. Copy proofs.json to frontend: "
echo "     cp $MIGRATION_OUTPUT/proofs.json ../../apps/tangle-dapp/public/data/migration-proofs.json"
echo ""
echo "  2. Execute EVM airdrop (separate step):"
echo "     The evm-airdrop.json contains 7,124 accounts totaling ~1.13M TNT"
echo "     Use a batch transfer tool to distribute these tokens."
echo ""

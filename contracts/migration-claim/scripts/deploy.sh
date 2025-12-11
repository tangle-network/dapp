#!/bin/bash
# Deploy TangleMigration contracts to local testnet
#
# Usage:
#   ./scripts/deploy.sh [--merkle-root <root>] [--total-supply <amount>]
#
# Prerequisites:
#   - Anvil running locally (anvil)
#   - Foundry installed
#
# Example:
#   # Start anvil in another terminal first
#   anvil
#
#   # Deploy with test merkle tree
#   ./scripts/deploy.sh

set -e

# Default values
RPC_URL="${RPC_URL:-http://localhost:8545}"
PRIVATE_KEY="${PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"  # Anvil default account 0
MERKLE_ROOT="${MERKLE_ROOT:-0x0000000000000000000000000000000000000000000000000000000000000000}"
TOTAL_SUPPLY="${TOTAL_SUPPLY:-100000000000000000000000000}"  # 100M TNT with 18 decimals

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --merkle-root)
      MERKLE_ROOT="$2"
      shift 2
      ;;
    --total-supply)
      TOTAL_SUPPLY="$2"
      shift 2
      ;;
    --rpc-url)
      RPC_URL="$2"
      shift 2
      ;;
    --private-key)
      PRIVATE_KEY="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "=== TangleMigration Deployment ==="
echo "RPC URL: $RPC_URL"
echo "Merkle Root: $MERKLE_ROOT"
echo "Total Supply: $TOTAL_SUPPLY"
echo ""

# Get deployer address
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
echo "Deployer: $DEPLOYER"
echo ""

cd "$(dirname "$0")/.."

# Deploy TNT token
echo "Deploying TNT token..."
TNT_ADDRESS=$(forge create src/TNT.sol:TNT \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args $DEPLOYER \
  --json | jq -r '.deployedTo')
echo "TNT deployed at: $TNT_ADDRESS"

# Mint initial supply to deployer
echo "Minting initial supply..."
cast send $TNT_ADDRESS "mintInitialSupply(address,uint256)" $DEPLOYER $TOTAL_SUPPLY \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY > /dev/null
echo "Minted $TOTAL_SUPPLY TNT to deployer"

# Deploy MockZKVerifier (for testing without SP1 proofs)
echo "Deploying MockZKVerifier..."
MOCK_VERIFIER_ADDRESS=$(forge create src/MockZKVerifier.sol:MockZKVerifier \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --json | jq -r '.deployedTo')
echo "MockZKVerifier deployed at: $MOCK_VERIFIER_ADDRESS"

# Deploy TangleMigration
echo "Deploying TangleMigration..."
MIGRATION_ADDRESS=$(forge create src/TangleMigration.sol:TangleMigration \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args $TNT_ADDRESS $MERKLE_ROOT $MOCK_VERIFIER_ADDRESS $DEPLOYER \
  --json | jq -r '.deployedTo')
echo "TangleMigration deployed at: $MIGRATION_ADDRESS"

# Transfer TNT to migration contract
echo "Funding migration contract..."
cast send $TNT_ADDRESS "transfer(address,uint256)" $MIGRATION_ADDRESS $TOTAL_SUPPLY \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY > /dev/null
echo "Transferred $TOTAL_SUPPLY TNT to migration contract"

# Verify balances
MIGRATION_BALANCE=$(cast call $TNT_ADDRESS "balanceOf(address)" $MIGRATION_ADDRESS --rpc-url $RPC_URL)
echo ""
echo "=== Deployment Complete ==="
echo ""
echo "TNT Token: $TNT_ADDRESS"
echo "MockZKVerifier: $MOCK_VERIFIER_ADDRESS"
echo "TangleMigration: $MIGRATION_ADDRESS"
echo ""
echo "Migration contract balance: $MIGRATION_BALANCE"
echo ""
echo "=== Environment Variables ==="
echo ""
echo "Add these to your .env.local:"
echo ""
echo "VITE_TANGLE_MIGRATION_ADDRESS=$MIGRATION_ADDRESS"
echo ""
echo "Or export for the current shell:"
echo ""
echo "export VITE_TANGLE_MIGRATION_ADDRESS=$MIGRATION_ADDRESS"

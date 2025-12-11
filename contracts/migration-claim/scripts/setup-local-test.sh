#!/bin/bash
# Complete local testing setup for TangleMigration
#
# This script:
# 1. Generates a merkle tree from snapshot (or test data)
# 2. Deploys contracts to local Anvil
# 3. Copies proofs file to frontend public folder
# 4. Outputs environment variables to configure
#
# Usage:
#   ./scripts/setup-local-test.sh [--snapshot <path>]
#
# Examples:
#   # Use test data
#   ./scripts/setup-local-test.sh
#
#   # Use real snapshot
#   ./scripts/setup-local-test.sh --snapshot /path/to/snapshot.json

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTRACT_DIR="$(dirname "$SCRIPT_DIR")"
DAPP_ROOT="$(cd "$CONTRACT_DIR/../.." && pwd)"
FRONTEND_PUBLIC="$DAPP_ROOT/apps/tangle-dapp/public/data"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== TangleMigration Local Test Setup ===${NC}"
echo ""

# Parse arguments
SNAPSHOT_PATH=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --snapshot)
      SNAPSHOT_PATH="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Check if Anvil is running
if ! curl -s http://localhost:8545 > /dev/null 2>&1; then
  echo -e "${RED}Error: Anvil not running${NC}"
  echo "Please start Anvil in another terminal:"
  echo "  anvil"
  exit 1
fi
echo -e "${GREEN}✓ Anvil is running${NC}"

# Step 1: Generate merkle tree
echo ""
echo -e "${YELLOW}Step 1: Generating Merkle Tree${NC}"

cd "$DAPP_ROOT"

if [ -n "$SNAPSHOT_PATH" ]; then
  echo "Using snapshot: $SNAPSHOT_PATH"
  npx ts-node "$CONTRACT_DIR/scripts/generateMerkleTree.ts" --input "$SNAPSHOT_PATH" --output "$CONTRACT_DIR/merkle-tree.json"
else
  echo "Using test data"
  npx ts-node "$CONTRACT_DIR/scripts/generateMerkleTree.ts" --test
  mv "$CONTRACT_DIR/merkle-tree-test.json" "$CONTRACT_DIR/merkle-tree.json" 2>/dev/null || true
fi

# Extract merkle root
MERKLE_ROOT=$(cat "$CONTRACT_DIR/merkle-tree.json" | jq -r '.root')
TOTAL_VALUE=$(cat "$CONTRACT_DIR/merkle-tree.json" | jq -r '.totalValue')
ENTRY_COUNT=$(cat "$CONTRACT_DIR/merkle-tree.json" | jq -r '.entryCount')

echo -e "${GREEN}✓ Merkle tree generated${NC}"
echo "  Root: $MERKLE_ROOT"
echo "  Total Value: $TOTAL_VALUE"
echo "  Entries: $ENTRY_COUNT"

# Step 2: Deploy contracts
echo ""
echo -e "${YELLOW}Step 2: Deploying Contracts${NC}"

cd "$CONTRACT_DIR"
DEPLOY_OUTPUT=$(./scripts/deploy.sh --merkle-root "$MERKLE_ROOT" --total-supply "$TOTAL_VALUE" 2>&1)

# Extract addresses from deploy output
MIGRATION_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "TangleMigration deployed at:" | awk '{print $NF}')
TNT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "TNT deployed at:" | awk '{print $NF}')

echo -e "${GREEN}✓ Contracts deployed${NC}"
echo "  TNT: $TNT_ADDRESS"
echo "  Migration: $MIGRATION_ADDRESS"

# Step 3: Copy proofs to frontend
echo ""
echo -e "${YELLOW}Step 3: Setting up Frontend${NC}"

mkdir -p "$FRONTEND_PUBLIC"

# Transform merkle-tree.json to the format expected by frontend
# The frontend expects entries keyed by SS58 address
cat "$CONTRACT_DIR/merkle-tree.json" | jq '.entries' > "$FRONTEND_PUBLIC/migration-proofs.json"

echo -e "${GREEN}✓ Proofs file copied to: $FRONTEND_PUBLIC/migration-proofs.json${NC}"

# Step 4: Output configuration
echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo -e "${YELLOW}Add to apps/tangle-dapp/.env.local:${NC}"
echo ""
echo "VITE_TANGLE_MIGRATION_ADDRESS=$MIGRATION_ADDRESS"
echo "VITE_MIGRATION_PROOFS_URL=/data/migration-proofs.json"
echo ""
echo -e "${YELLOW}Test accounts (from test data):${NC}"
echo ""
echo "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY - 1,000,000 TNT"
echo "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty - 500,000 TNT"
echo "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y - 250,000 TNT"
echo "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy - 100,000 TNT"
echo "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw - 50,000 TNT"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Create/update apps/tangle-dapp/.env.local with the variables above"
echo "2. Start the dApp: yarn start:tangle-dapp"
echo "3. Navigate to: http://localhost:4200/claim/migration"
echo "4. Import a test account into Polkadot.js extension"
echo "5. Connect MetaMask to Localhost:8545"
echo ""
echo -e "${YELLOW}Note:${NC} The MockZKVerifier accepts any proof, so you can test"
echo "the flow without running the SP1 prover."

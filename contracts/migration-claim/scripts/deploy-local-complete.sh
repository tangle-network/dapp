#!/bin/bash
# Complete local deployment for TangleMigration
#
# This script handles everything needed for local testing:
# 1. Generates test merkle tree with known accounts
# 2. Deploys all contracts (TNT, MockZKVerifier, TangleMigration)
# 3. Copies proofs to frontend
# 4. Outputs environment variables for both frontend and relayer
#
# Prerequisites:
#   - Foundry installed (forge, cast)
#   - Node.js and yarn
#   - Anvil running locally (anvil)
#
# Usage:
#   ./scripts/deploy-local-complete.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_DIR="$(dirname "$SCRIPT_DIR")"
DAPP_ROOT="$(cd "$CONTRACT_DIR/../.." && pwd)"
FRONTEND_PUBLIC="$DAPP_ROOT/apps/tangle-dapp/public/data"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  TangleMigration Local Deployment${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Configuration - use Anvil defaults
RPC_URL="${RPC_URL:-http://localhost:8545}"
PRIVATE_KEY="${PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

command -v forge >/dev/null 2>&1 || {
    echo -e "${RED}Error: Foundry not installed${NC}"
    echo "Install with: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
}

command -v cast >/dev/null 2>&1 || {
    echo -e "${RED}Error: cast not found${NC}"
    exit 1
}

command -v node >/dev/null 2>&1 || {
    echo -e "${RED}Error: Node.js not installed${NC}"
    exit 1
}

# Check if Anvil is running
if ! cast block-number --rpc-url "$RPC_URL" >/dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to RPC at $RPC_URL${NC}"
    echo ""
    echo "Please start Anvil in another terminal:"
    echo "  anvil"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Step 1: Generate test merkle tree
echo -e "${YELLOW}Step 1: Generating test merkle tree...${NC}"
cd "$SCRIPT_DIR"

# Install script dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing script dependencies..."
    yarn install 2>/dev/null || npm install 2>/dev/null || {
        echo -e "${RED}Failed to install dependencies. Installing manually...${NC}"
        yarn add @openzeppelin/merkle-tree viem @polkadot/util-crypto typescript ts-node @types/node 2>/dev/null
    }
fi

# Generate test merkle tree
npx ts-node generateMerkleTree.ts --test 2>/dev/null || {
    echo "Retrying with direct ts-node..."
    yarn add @openzeppelin/merkle-tree viem @polkadot/util-crypto typescript ts-node @types/node 2>/dev/null
    npx ts-node generateMerkleTree.ts --test
}

# Check if merkle tree was generated
if [ ! -f "merkle-tree-test.json" ]; then
    echo -e "${RED}Error: Failed to generate merkle tree${NC}"
    exit 1
fi

# Extract values from generated tree
MERKLE_ROOT=$(node -e "console.log(require('./merkle-tree-test.json').root)")
TOTAL_VALUE=$(node -e "console.log(require('./merkle-tree-test.json').totalValue)")
ENTRY_COUNT=$(node -e "console.log(require('./merkle-tree-test.json').entryCount)")

echo -e "${GREEN}✓ Merkle tree generated${NC}"
echo "  Root: $MERKLE_ROOT"
echo "  Total: $TOTAL_VALUE wei"
echo "  Accounts: $ENTRY_COUNT"
echo ""

# Step 2: Build contracts
echo -e "${YELLOW}Step 2: Building contracts...${NC}"
cd "$CONTRACT_DIR"

# Install foundry dependencies if needed
if [ ! -d "lib/forge-std" ]; then
    forge install foundry-rs/forge-std --no-commit 2>/dev/null || true
fi
if [ ! -d "lib/openzeppelin-contracts" ]; then
    forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit 2>/dev/null || true
fi

forge build --quiet
echo -e "${GREEN}✓ Contracts built${NC}"
echo ""

# Step 3: Deploy contracts using forge script
echo -e "${YELLOW}Step 3: Deploying contracts...${NC}"

DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
echo "  Deployer: $DEPLOYER"

# Run deployment script
DEPLOY_OUTPUT=$(MERKLE_ROOT="$MERKLE_ROOT" TOTAL_VALUE="$TOTAL_VALUE" PRIVATE_KEY="$PRIVATE_KEY" \
    forge script script/DeployLocal.s.sol:DeployLocal \
    --rpc-url "$RPC_URL" \
    --broadcast \
    -vvv 2>&1)

# Check if deployment succeeded
if echo "$DEPLOY_OUTPUT" | grep -q "ONCHAIN EXECUTION COMPLETE"; then
    echo -e "  ${GREEN}✓ Deployment transaction broadcast${NC}"
else
    echo -e "${RED}Error: Deployment failed${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Extract addresses from output
TNT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "TNT_ADDRESS=" | sed 's/.*TNT_ADDRESS=//' | tr -d ' ')
VERIFIER_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "VERIFIER_ADDRESS=" | sed 's/.*VERIFIER_ADDRESS=//' | tr -d ' ')
MIGRATION_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "MIGRATION_ADDRESS=" | sed 's/.*MIGRATION_ADDRESS=//' | tr -d ' ')

if [ -z "$TNT_ADDRESS" ] || [ -z "$VERIFIER_ADDRESS" ] || [ -z "$MIGRATION_ADDRESS" ]; then
    echo -e "${RED}Error: Could not parse deployed addresses${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo -e "  ${GREEN}✓ TNT Token: $TNT_ADDRESS${NC}"
echo -e "  ${GREEN}✓ MockZKVerifier: $VERIFIER_ADDRESS${NC}"
echo -e "  ${GREEN}✓ TangleMigration: $MIGRATION_ADDRESS${NC}"

# Verify migration balance
MIGRATION_BALANCE=$(cast call "$TNT_ADDRESS" "balanceOf(address)" "$MIGRATION_ADDRESS" --rpc-url "$RPC_URL" 2>/dev/null)
echo -e "  ${GREEN}✓ Migration funded: $MIGRATION_BALANCE${NC}"
echo ""

# Step 4: Copy proofs to frontend
echo -e "${YELLOW}Step 4: Setting up frontend data...${NC}"
mkdir -p "$FRONTEND_PUBLIC"

# Copy merkle tree entries to frontend format
# The generateMerkleTree.ts now outputs the correct format: { ss58Address: { proof: [...], leaf: [ss58Address, amount] } }
node -e "
const tree = require('./scripts/merkle-tree-test.json');
require('fs').writeFileSync('$FRONTEND_PUBLIC/migration-proofs.json', JSON.stringify(tree.entries, null, 2));
console.log('Copied', Object.keys(tree.entries).length, 'entries to frontend');
" 2>/dev/null

echo -e "${GREEN}✓ Proofs copied to frontend${NC}"
echo ""

# Step 5: Create environment files
echo -e "${YELLOW}Step 5: Creating environment files...${NC}"

# Create tangle-dapp .env.local
cat > "$DAPP_ROOT/apps/tangle-dapp/.env.local" << EOF
# Auto-generated by deploy-local-complete.sh
# Generated at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

# TangleMigration contract address
VITE_TANGLE_MIGRATION_ADDRESS=$MIGRATION_ADDRESS

# Claim relayer URL (start with: cd apps/claim-relayer && yarn dev)
VITE_CLAIM_RELAYER_URL=http://localhost:3001

# Migration proofs file URL
VITE_MIGRATION_PROOFS_URL=/data/migration-proofs.json

# Use mock proof generation for local testing
VITE_MOCK_PROOF=true
EOF
echo -e "  ${GREEN}✓ Created apps/tangle-dapp/.env.local${NC}"

# Create claim-relayer .env
cat > "$DAPP_ROOT/apps/claim-relayer/.env" << EOF
# Auto-generated by deploy-local-complete.sh
# Generated at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Relayer wallet private key (Anvil account 1 - has 10000 ETH)
RELAYER_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

# TangleMigration contract address
MIGRATION_CONTRACT=$MIGRATION_ADDRESS

# RPC endpoint (Anvil local)
RPC_URL=http://localhost:8545

# Chain ID (Anvil default)
CHAIN_ID=31337

# Server port
PORT=3001
EOF
echo -e "  ${GREEN}✓ Created apps/claim-relayer/.env${NC}"
echo ""

# Step 6: Output summary
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Deployment Complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}Contract Addresses:${NC}"
echo "  TNT Token:        $TNT_ADDRESS"
echo "  MockZKVerifier:   $VERIFIER_ADDRESS"
echo "  TangleMigration:  $MIGRATION_ADDRESS"
echo ""
echo -e "${GREEN}Merkle Tree:${NC}"
echo "  Root:     $MERKLE_ROOT"
echo "  Total:    $TOTAL_VALUE wei"
echo "  Accounts: $ENTRY_COUNT"
echo ""
echo -e "${GREEN}Environment Files Created:${NC}"
echo "  ✓ apps/tangle-dapp/.env.local"
echo "  ✓ apps/claim-relayer/.env"
echo ""
echo -e "${YELLOW}=== Test Accounts (import into Polkadot.js extension) ===${NC}"
echo ""
echo "These are standard Substrate dev accounts:"
echo "  Account    | SS58 Address                                       | Claimable"
echo "  -----------|----------------------------------------------------|-----------"
echo "  Alice      | 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY   | 1,000,000 TNT"
echo "  Bob        | 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty   | 500,000 TNT"
echo "  Charlie    | 5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y   | 250,000 TNT"
echo "  Dave       | 5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy   | 100,000 TNT"
echo "  Eve        | 5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw   | 50,000 TNT"
echo ""
echo "To import Alice in Polkadot.js extension:"
echo "  1. Click '+' -> 'Import account from pre-existing seed'"
echo "  2. Enter the FULL seed phrase WITH derivation path:"
echo ""
echo "     bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice"
echo ""
echo "  (For Bob use //Bob, for Charlie use //Charlie, etc.)"
echo ""
echo -e "${YELLOW}=== Next Steps ===${NC}"
echo ""
echo "1. Start the relayer:    cd apps/claim-relayer && yarn dev"
echo "2. Start the dApp:       yarn start:tangle-dapp"
echo "3. Navigate to:          http://localhost:4200/claim/migration"
echo "4. Import test account:  Use //Alice in Polkadot.js extension"
echo "5. Connect MetaMask:     Add Localhost:8545 network (Chain ID: 31337)"
echo ""
echo -e "${GREEN}Note: MockZKVerifier accepts ANY proof, so you can test${NC}"
echo -e "${GREEN}the entire flow without running the SP1 prover.${NC}"
echo ""

# Save deployment info to file for reference
cat > "$CONTRACT_DIR/deployment-local.json" << EOF
{
  "network": "localhost",
  "chainId": 31337,
  "rpcUrl": "$RPC_URL",
  "contracts": {
    "TNT": "$TNT_ADDRESS",
    "MockZKVerifier": "$VERIFIER_ADDRESS",
    "TangleMigration": "$MIGRATION_ADDRESS"
  },
  "merkleRoot": "$MERKLE_ROOT",
  "totalValue": "$TOTAL_VALUE",
  "entryCount": $ENTRY_COUNT,
  "deployer": "$DEPLOYER",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo -e "${GREEN}Deployment info saved to: contracts/migration-claim/deployment-local.json${NC}"

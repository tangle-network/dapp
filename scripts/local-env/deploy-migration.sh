#!/bin/bash
# Deploy TangleMigration contracts to local Anvil testnet
#
# Prerequisites:
# - Anvil running on port 8545 (via start-local-env.sh)
# - Foundry installed (forge)
# - Migration proofs generated in /Users/drew/webb/tangle/types/migration_output/
#
# Usage: ./scripts/local-env/deploy-migration.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DAPP_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONTRACT_DIR="$DAPP_ROOT/contracts/migration-claim"

# Check local migration_output first, then external
if [[ -d "$DAPP_ROOT/scripts/migration/migration_output" ]]; then
    MIGRATION_OUTPUT="$DAPP_ROOT/scripts/migration/migration_output"
elif [[ -d "/Users/drew/webb/tangle/types/migration_output" ]]; then
    MIGRATION_OUTPUT="/Users/drew/webb/tangle/types/migration_output"
else
    echo "Error: migration_output directory not found"
    echo "Run: cd scripts/migration && npm install && npm run merkleize:latest"
    exit 1
fi

# Configuration
ANVIL_PORT="${ANVIL_PORT:-8545}"
RPC_URL="${RPC_URL:-http://localhost:$ANVIL_PORT}"
PRIVATE_KEY="${PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "============================================"
echo -e "${BOLD}TangleMigration Deployment${NC}"
echo "============================================"
echo ""

# Check prerequisites
log_info "Checking prerequisites..."

command -v forge >/dev/null 2>&1 || { log_error "Foundry (forge) not installed. Install: https://getfoundry.sh"; exit 1; }

if ! curl -s "$RPC_URL" -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' > /dev/null 2>&1; then
    log_error "Cannot connect to RPC at $RPC_URL"
    log_error "Make sure Anvil is running: ./scripts/local-env/start-local-env.sh"
    exit 1
fi

if [[ ! -f "$MIGRATION_OUTPUT/proofs.json" ]]; then
    log_error "Migration proofs not found at $MIGRATION_OUTPUT/proofs.json"
    log_error "Run the migration snapshot generator first"
    exit 1
fi

log_success "All prerequisites met"

# Get Merkle root
log_info "Reading Merkle root from migration output..."
if [[ -f "$MIGRATION_OUTPUT/merkle-tree.json" ]]; then
    MERKLE_ROOT=$(grep -o '"0x[a-fA-F0-9]\{64\}"' "$MIGRATION_OUTPUT/merkle-tree.json" | head -1 | tr -d '"')
    log_success "Merkle Root: $MERKLE_ROOT"
else
    log_error "merkle-tree.json not found at $MIGRATION_OUTPUT"
    exit 1
fi

# Build contracts
log_info "Building contracts..."
cd "$CONTRACT_DIR"

# Install dependencies if needed
if [[ ! -d "lib/forge-std" ]]; then
    log_info "Installing Foundry dependencies..."
    forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-git 2>/dev/null || true
fi

forge build --quiet

# Deploy
log_info "Deploying contracts..."

MERKLE_ROOT="$MERKLE_ROOT" \
USE_MOCK_VERIFIER="true" \
PRIVATE_KEY="$PRIVATE_KEY" \
forge script script/DeployTangleMigration.s.sol:DeployTangleMigration \
    --rpc-url "$RPC_URL" \
    --broadcast \
    --quiet \
    2>&1 | tee /tmp/migration-deploy.log

# Extract addresses from broadcast
BROADCAST_FILE=$(ls -t broadcast/DeployTangleMigration.s.sol/*/run-latest.json 2>/dev/null | head -1)

if [[ -f "$BROADCAST_FILE" ]]; then
    TNT_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "TNT") | .contractAddress' "$BROADCAST_FILE" 2>/dev/null | head -1)
    MIGRATION_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "TangleMigration") | .contractAddress' "$BROADCAST_FILE" 2>/dev/null | head -1)
    VERIFIER_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "MockZKVerifier") | .contractAddress' "$BROADCAST_FILE" 2>/dev/null | head -1)
fi

# Fallback to grep if jq fails
if [[ -z "${TNT_ADDRESS:-}" ]]; then
    TNT_ADDRESS=$(grep -o '"contractName": "TNT"' -A5 "$BROADCAST_FILE" 2>/dev/null | grep '"contractAddress"' | head -1 | grep -o '0x[a-fA-F0-9]\{40\}' || echo "")
fi
if [[ -z "${MIGRATION_ADDRESS:-}" ]]; then
    MIGRATION_ADDRESS=$(grep -o '"contractName": "TangleMigration"' -A5 "$BROADCAST_FILE" 2>/dev/null | grep '"contractAddress"' | head -1 | grep -o '0x[a-fA-F0-9]\{40\}' || echo "")
fi
if [[ -z "${VERIFIER_ADDRESS:-}" ]]; then
    VERIFIER_ADDRESS=$(grep -o '"contractName": "MockZKVerifier"' -A5 "$BROADCAST_FILE" 2>/dev/null | grep '"contractAddress"' | head -1 | grep -o '0x[a-fA-F0-9]\{40\}' || echo "")
fi

# Copy proofs to frontend
log_info "Copying proofs.json to frontend..."
PROOFS_DEST="$DAPP_ROOT/apps/tangle-dapp/public/data"
mkdir -p "$PROOFS_DEST"
cp "$MIGRATION_OUTPUT/proofs.json" "$PROOFS_DEST/migration-proofs.json"
log_success "Proofs copied to $PROOFS_DEST/migration-proofs.json"

# Create/update .env.local
ENV_FILE="$DAPP_ROOT/apps/tangle-dapp/.env.local"
log_info "Updating $ENV_FILE..."

# Append or update migration env vars
{
    echo ""
    echo "# TangleMigration Contracts (Local Testnet)"
    echo "VITE_TNT_TOKEN_ADDRESS=$TNT_ADDRESS"
    echo "VITE_TANGLE_MIGRATION_ADDRESS=$MIGRATION_ADDRESS"
    echo "VITE_ZK_VERIFIER_ADDRESS=$VERIFIER_ADDRESS"
    echo "VITE_MIGRATION_MERKLE_ROOT=$MERKLE_ROOT"
    echo "VITE_MIGRATION_PROOFS_URL=/data/migration-proofs.json"
} >> "$ENV_FILE"

log_success "Environment variables added to $ENV_FILE"

# Print summary
echo ""
echo "============================================"
echo -e "${GREEN}${BOLD}Deployment Complete!${NC}"
echo "============================================"
echo ""
echo -e "${CYAN}Contract Addresses:${NC}"
echo "  TNT Token:        $TNT_ADDRESS"
echo "  TangleMigration:  $MIGRATION_ADDRESS"
echo "  ZK Verifier:      $VERIFIER_ADDRESS (MockZKVerifier)"
echo ""
echo -e "${CYAN}Merkle Root:${NC}"
echo "  $MERKLE_ROOT"
echo ""
echo -e "${CYAN}Migration Stats:${NC}"
echo "  7,004 Substrate accounts (108.14M TNT - requires ZK proof)"
echo "  7,124 EVM accounts (1.13M TNT - direct airdrop)"
echo ""
echo -e "${CYAN}Frontend Config:${NC}"
echo "  Proofs: apps/tangle-dapp/public/data/migration-proofs.json"
echo "  Env:    apps/tangle-dapp/.env.local"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Start the dApp: yarn start:tangle-dapp"
echo "  2. Navigate to: http://localhost:5173/claim/migration"
echo "  3. Test with any SS58 address from proofs.json"
echo ""
echo -e "${CYAN}Test Addresses (from proofs.json):${NC}"
echo "  tgFbShs5bUXZ8bcFfHkRm5vDbUQbUR3QQNhQktuK2mCW19qCR"
echo "  tgDj7AtseoEFPvVGTQowV6x1YCTfDQ5Ms7FyiJ2P273za9tik"
echo ""

#!/bin/bash
# Deploy TangleMigration contracts and execute EVM airdrop
#
# This script reads from tnt-core/packages/migration-claim to get exact totals
# and merkle root, then deploys contracts and executes the EVM airdrop.
#
# Prerequisites:
# - Anvil running on port 8545 (via start-local-env.sh)
# - Foundry installed (forge)
# - Merkle tree + EVM claims present in tnt-core/packages/migration-claim
#
# Usage:
#   ./scripts/local-env/deploy-migration.sh           # Deploy contracts only
#   ./scripts/local-env/deploy-migration.sh --airdrop # Deploy + execute EVM airdrop

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DAPP_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
if [[ -z "${TNT_CORE_DIR:-}" ]]; then
    if [[ -d "$DAPP_ROOT/../tnt-core" ]]; then
        TNT_CORE_DIR="$DAPP_ROOT/../tnt-core"
    elif [[ -d "$DAPP_ROOT/../../tnt-core" ]]; then
        TNT_CORE_DIR="$DAPP_ROOT/../../tnt-core"
    elif [[ -d "/Users/drew/webb/tnt-core" ]]; then
        TNT_CORE_DIR="/Users/drew/webb/tnt-core"
    else
        echo "Error: TNT_CORE_DIR not found. Set TNT_CORE_DIR to your tnt-core repo."
        exit 1
    fi
fi

CONTRACT_DIR="$TNT_CORE_DIR/packages/migration-claim"
MIGRATION_DIR="$CONTRACT_DIR"

if [[ ! -f "$MIGRATION_DIR/merkle-tree.json" ]]; then
    echo "Error: merkle-tree.json not found at $MIGRATION_DIR"
    exit 1
fi

if [[ ! -f "$MIGRATION_DIR/evm-claims.json" ]]; then
    echo "Error: evm-claims.json not found at $MIGRATION_DIR"
    exit 1
fi

# Configuration
ANVIL_PORT="${ANVIL_PORT:-8545}"
RPC_URL="${RPC_URL:-http://localhost:$ANVIL_PORT}"
PRIVATE_KEY="${PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"
EXECUTE_AIRDROP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --airdrop)
            EXECUTE_AIRDROP=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

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
command -v node >/dev/null 2>&1 || { log_error "Node.js not installed"; exit 1; }

if ! curl -s "$RPC_URL" -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' > /dev/null 2>&1; then
    log_error "Cannot connect to RPC at $RPC_URL"
    log_error "Make sure Anvil is running: ./scripts/local-env/start-local-env.sh"
    exit 1
fi

log_success "All prerequisites met"
log_info "Migration data: $MIGRATION_DIR"

# Read migration data using Node.js
log_info "Reading migration data..."

DIST_DATA=$(node -e "
const fs = require('fs');
const merkle = JSON.parse(fs.readFileSync('$MIGRATION_DIR/merkle-tree.json','utf8'));
const evm = JSON.parse(fs.readFileSync('$MIGRATION_DIR/evm-claims.json','utf8'));
const treasuryPath = '$MIGRATION_DIR/treasury-carveout.json';
const foundationPath = '$MIGRATION_DIR/foundation-carveout.json';
const treasury = fs.existsSync(treasuryPath) ? JSON.parse(fs.readFileSync(treasuryPath,'utf8')) : { amount: '0' };
const foundation = fs.existsSync(foundationPath) ? JSON.parse(fs.readFileSync(foundationPath,'utf8')) : { amount: '0' };

console.log(JSON.stringify({
  merkleRoot: merkle.root,
  totalSubstrate: merkle.totalValue,
  totalEvm: evm.totalAmount,
  substrateAccounts: merkle.entryCount,
  evmAccounts: evm.totalAccounts,
  treasuryAmount: treasury.amount || '0',
  foundationAmount: foundation.amount || '0'
}));
")

MERKLE_ROOT=$(echo "$DIST_DATA" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).merkleRoot")
TOTAL_SUBSTRATE=$(echo "$DIST_DATA" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).totalSubstrate")
TOTAL_EVM=$(echo "$DIST_DATA" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).totalEvm")
SUBSTRATE_ACCOUNTS=$(echo "$DIST_DATA" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).substrateAccounts")
EVM_ACCOUNTS=$(echo "$DIST_DATA" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).evmAccounts")
TREASURY_AMOUNT=$(echo "$DIST_DATA" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).treasuryAmount")
FOUNDATION_AMOUNT=$(echo "$DIST_DATA" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).foundationAmount")

# Only include carveouts if recipients are provided
if [[ -z "${TREASURY_RECIPIENT:-}" ]]; then
    TREASURY_AMOUNT="0"
fi
if [[ -z "${FOUNDATION_RECIPIENT:-}" ]]; then
    FOUNDATION_AMOUNT="0"
fi

log_success "Migration data loaded"
echo ""
echo -e "${CYAN}Migration Summary:${NC}"
echo "  Merkle Root:        $MERKLE_ROOT"
echo "  Substrate Accounts: $SUBSTRATE_ACCOUNTS"
echo "  Substrate Total:    $(node -pe "BigInt('$TOTAL_SUBSTRATE') / BigInt(1e18)") TNT"
echo "  EVM Accounts:       $EVM_ACCOUNTS"
echo "  EVM Total:          $(node -pe "BigInt('$TOTAL_EVM') / BigInt(1e18)") TNT"
echo ""

# Build contracts
log_info "Building contracts..."
cd "$CONTRACT_DIR"

# Install dependencies if needed
if [[ ! -d "lib/forge-std" ]]; then
    log_info "Installing Foundry dependencies..."
    forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-git 2>/dev/null || true
fi

forge build --quiet

# Deploy contracts
log_info "Deploying contracts..."

MERKLE_ROOT="$MERKLE_ROOT" \
TOTAL_SUBSTRATE="$TOTAL_SUBSTRATE" \
TOTAL_EVM="$TOTAL_EVM" \
USE_MOCK_VERIFIER="true" \
ALLOW_STANDALONE_TOKEN="${ALLOW_STANDALONE_TOKEN:-false}" \
TNT_TOKEN="${TNT_TOKEN_ADDRESS:-}" \
TNT_TOKEN_ADDRESS="${TNT_TOKEN_ADDRESS:-}" \
TREASURY_AMOUNT="${TREASURY_AMOUNT:-0}" \
FOUNDATION_AMOUNT="${FOUNDATION_AMOUNT:-0}" \
PRIVATE_KEY="$PRIVATE_KEY" \
forge script script/DeployTangleMigration.s.sol:DeployTangleMigration \
    --rpc-url "$RPC_URL" \
    --broadcast \
    2>&1 | tee /tmp/migration-deploy.log

# Extract addresses from broadcast
BROADCAST_FILE=$(ls -t broadcast/DeployTangleMigration.s.sol/*/run-latest.json 2>/dev/null | head -1)

TNT_ADDRESS=""
MIGRATION_ADDRESS=""
VERIFIER_ADDRESS=""

if [[ -f "$BROADCAST_FILE" ]]; then
    TNT_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "TNT") | .contractAddress' "$BROADCAST_FILE" 2>/dev/null | head -1)
    MIGRATION_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "TangleMigration") | .contractAddress' "$BROADCAST_FILE" 2>/dev/null | head -1)
    VERIFIER_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "MockZKVerifier") | .contractAddress' "$BROADCAST_FILE" 2>/dev/null | head -1)
fi

if [[ -z "$TNT_ADDRESS" || "$TNT_ADDRESS" == "null" ]]; then
    TNT_ADDRESS="${TNT_TOKEN_ADDRESS:-}"
fi

if [[ -z "$TNT_ADDRESS" || "$TNT_ADDRESS" == "null" ]]; then
    log_error "Failed to extract contract addresses from deployment"
    exit 1
fi

log_success "Contracts deployed"
echo ""
echo -e "${CYAN}Contract Addresses:${NC}"
echo "  TNT Token:        $TNT_ADDRESS"
echo "  TangleMigration:  $MIGRATION_ADDRESS"
echo "  ZK Verifier:      $VERIFIER_ADDRESS (Mock)"
echo ""

# Execute EVM airdrop if requested
if [[ "$EXECUTE_AIRDROP" == "true" ]]; then
    log_info "Executing EVM airdrop..."

    # Execute airdrop in batches using Node.js + cast (transfer-based so it works with the canonical TNT)
    node -e "
	const evm = require('$MIGRATION_DIR/evm-claims.json');
	const { execSync } = require('child_process');

	const TNT_ADDRESS = '$TNT_ADDRESS';
	const RPC_URL = '$RPC_URL';
	const PRIVATE_KEY = '$PRIVATE_KEY';
	const BATCH_SIZE = 100;

	const entries = evm.claims || [];
	console.log('Total EVM recipients:', entries.length);

	for (let i = 0; i < entries.length; i += BATCH_SIZE) {
	    const batch = entries.slice(i, i + BATCH_SIZE);
	    const recipients = batch.map((entry) => entry.address);
	    const amounts = batch.map((entry) => entry.amount);

	    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
	    const totalBatches = Math.ceil(entries.length / BATCH_SIZE);

	    console.log('Processing batch', batchNum, '/', totalBatches, '(' + batch.length + ' recipients)');

	    try {
	        for (let j = 0; j < recipients.length; j++) {
	            execSync(
	                'cast send --rpc-url ' + RPC_URL + ' --private-key ' + PRIVATE_KEY + ' ' + TNT_ADDRESS + ' \"transfer(address,uint256)\" ' + recipients[j] + ' ' + amounts[j],
	                { stdio: 'pipe' }
	            );
	        }
	    } catch (e) {
	        console.error('Batch', batchNum, 'failed:', e.message);
	        process.exit(1);
	    }
	}

console.log('EVM airdrop complete!');
"
    log_success "EVM airdrop executed"
fi

# Copy merkle tree data to frontend
log_info "Copying merkle-tree.json to frontend..."
PROOFS_DEST="$DAPP_ROOT/apps/tangle-dapp/public/data"
mkdir -p "$PROOFS_DEST"
cp "$MIGRATION_DIR/merkle-tree.json" "$PROOFS_DEST/migration-proofs.json"
log_success "Merkle data copied to $PROOFS_DEST/migration-proofs.json"

# Update .env.local
ENV_FILE="$DAPP_ROOT/apps/tangle-dapp/.env.local"
log_info "Updating $ENV_FILE..."

# Remove old migration env vars if present
if [[ -f "$ENV_FILE" ]]; then
    sed -i.bak '/^VITE_TNT_TOKEN_ADDRESS=/d' "$ENV_FILE" 2>/dev/null || true
    sed -i.bak '/^VITE_TANGLE_MIGRATION_ADDRESS=/d' "$ENV_FILE" 2>/dev/null || true
    sed -i.bak '/^VITE_ZK_VERIFIER_ADDRESS=/d' "$ENV_FILE" 2>/dev/null || true
    sed -i.bak '/^VITE_MIGRATION_MERKLE_ROOT=/d' "$ENV_FILE" 2>/dev/null || true
    rm -f "$ENV_FILE.bak"
fi

# Append migration env vars
cat >> "$ENV_FILE" << EOF

# TangleMigration Contracts (deployed $(date +%Y-%m-%d))
VITE_TNT_TOKEN_ADDRESS=$TNT_ADDRESS
VITE_TANGLE_MIGRATION_ADDRESS=$MIGRATION_ADDRESS
VITE_ZK_VERIFIER_ADDRESS=$VERIFIER_ADDRESS
VITE_MIGRATION_MERKLE_ROOT=$MERKLE_ROOT
EOF

log_success "Environment variables updated"

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
echo -e "${CYAN}Token Distribution:${NC}"
echo "  Substrate Claims: $(node -pe "BigInt('$TOTAL_SUBSTRATE') / BigInt(1e18)") TNT ($SUBSTRATE_ACCOUNTS accounts)"
echo "  EVM Airdrop:      $(node -pe "BigInt('$TOTAL_EVM') / BigInt(1e18)") TNT ($EVM_ACCOUNTS accounts)"
if [[ "$EXECUTE_AIRDROP" == "true" ]]; then
    echo "  EVM Status:       Airdropped directly to holders"
else
    echo "  EVM Status:       Pending (run with --airdrop to execute)"
fi
echo ""
echo -e "${CYAN}Merkle Root:${NC}"
echo "  $MERKLE_ROOT"
echo ""
echo -e "${CYAN}Frontend Config:${NC}"
echo "  Merkle data: apps/tangle-dapp/public/data/migration-proofs.json"
echo "  Env:    apps/tangle-dapp/.env.local"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Restart the dApp to pick up new env vars: yarn start:tangle-dapp"
echo "  2. Navigate to: http://localhost:5173/claim/migration"
if [[ "$EXECUTE_AIRDROP" != "true" ]]; then
    echo "  3. Run './scripts/local-env/deploy-migration.sh --airdrop' to airdrop EVM tokens"
fi
echo ""

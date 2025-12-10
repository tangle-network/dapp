#!/bin/bash
# Start a fully simulatable local environment for leaderboard development
# Based on tnt-core/scripts/e2e-local.sh

set -euo pipefail

# Configuration
TNT_CORE_DIR="${TNT_CORE_DIR:-../../../tnt-core}"
ANVIL_PORT=8545
ANVIL_CHAIN_ID=84532
GRAPHQL_PORT=8080

# Resolve to absolute path
TNT_CORE_DIR="$(cd "$(dirname "$0")" && cd "$TNT_CORE_DIR" && pwd)"
INDEXER_DIR="$TNT_CORE_DIR/indexer"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cleanup() {
    log_info "Cleaning up..."
    [[ -n "${ANVIL_PID:-}" ]] && kill "$ANVIL_PID" 2>/dev/null || true
    [[ -n "${INDEXER_PID:-}" ]] && kill "$INDEXER_PID" 2>/dev/null || true
    [[ -n "${ACTIVITY_PID:-}" ]] && kill "$ACTIVITY_PID" 2>/dev/null || true
    lsof -ti:9898 | xargs kill 2>/dev/null || true

    if [[ -d "$INDEXER_DIR/generated" ]]; then
        cd "$INDEXER_DIR/generated"
        docker compose down 2>/dev/null || true
    fi
    log_info "Cleanup complete"
}
trap cleanup EXIT

# Kill any leftover processes
pkill -f "ts-node src/Index" 2>/dev/null || true
lsof -ti:9898 | xargs kill 2>/dev/null || true
lsof -ti:$ANVIL_PORT | xargs kill 2>/dev/null || true
sleep 1

check_prerequisites() {
    log_info "Checking prerequisites..."

    command -v anvil &>/dev/null || { log_error "anvil not found. Install Foundry: https://getfoundry.sh"; exit 1; }
    command -v forge &>/dev/null || { log_error "forge not found. Install Foundry: https://getfoundry.sh"; exit 1; }
    command -v docker &>/dev/null || { log_error "docker not found. Install Docker"; exit 1; }
    command -v pnpm &>/dev/null || { log_error "pnpm not found. Install pnpm"; exit 1; }

    [[ -d "$TNT_CORE_DIR" ]] || { log_error "TNT_CORE_DIR not found: $TNT_CORE_DIR"; exit 1; }
    [[ -d "$INDEXER_DIR" ]] || { log_error "Indexer directory not found: $INDEXER_DIR"; exit 1; }

    log_success "All prerequisites met"
    log_info "TNT_CORE_DIR: $TNT_CORE_DIR"
}

start_anvil() {
    log_info "Starting Anvil on port $ANVIL_PORT..."

    anvil --chain-id $ANVIL_CHAIN_ID --port $ANVIL_PORT --block-time 1 --base-fee 0 --gas-limit 30000000 --disable-code-size-limit --silent &
    ANVIL_PID=$!
    sleep 2

    if ! curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' > /dev/null; then
        log_error "Failed to start Anvil"
        exit 1
    fi

    log_success "Anvil started (PID: $ANVIL_PID)"
}

deploy_contracts() {
    log_info "Deploying contracts..."
    cd "$TNT_CORE_DIR"

    # Clear forge broadcast cache to force fresh deployment
    log_info "Clearing forge broadcast cache..."
    rm -rf broadcast/LocalTestnet.s.sol/ 2>/dev/null || true

    # Clean forge cache and rebuild
    forge clean 2>/dev/null || true

    # Anvil's default deployer private key
    local ANVIL_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

    # Run forge script (may return non-zero due to size warnings, but deployment still succeeds)
    forge script script/v2/LocalTestnet.s.sol:LocalTestnetSetup \
        --rpc-url http://127.0.0.1:$ANVIL_PORT \
        --private-key "$ANVIL_PRIVATE_KEY" \
        --broadcast \
        --non-interactive \
        --slow 2>&1 | tee /tmp/deploy.log || true

    # Give anvil time to process transactions
    sleep 2

    # Check if deployment actually happened by verifying deployer nonce
    local deployer_nonce=$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_getTransactionCount","params":["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "latest"],"id":1}' \
        | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

    if [[ "$deployer_nonce" == "0x0" ]]; then
        log_error "Deployment failed - no transactions sent. Check /tmp/deploy.log"
        exit 1
    fi

    # Verify contract code exists
    local contract_code=$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "latest"],"id":1}' \
        | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

    if [[ "$contract_code" == "0x" || -z "$contract_code" ]]; then
        log_error "Tangle contract has no code. Deployment may have failed."
        exit 1
    fi

    log_info "Deployer nonce: $deployer_nonce"
    log_info "Tangle contract code length: ${#contract_code} chars"

    # Deterministic addresses from Anvil
    export TANGLE_PROXY="0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    export RESTAKING_PROXY="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    export STATUS_REGISTRY="0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"

    log_success "Contracts deployed"
}

start_indexer() {
    log_info "Setting up Envio indexer..."
    cd "$INDEXER_DIR"

    # Use local config
    cp config.local.yaml config.yaml

    # Run codegen
    log_info "Running Envio codegen..."
    pnpm codegen

    # Setup generated package symlink
    log_info "Setting up generated package symlink..."
    rm -rf node_modules/.pnpm/generated@* 2>/dev/null || true
    rm -rf node_modules/generated 2>/dev/null || true
    ln -sfn ../generated node_modules/generated

    # Clear persisted state
    rm -f "$INDEXER_DIR/generated/persisted_state.envio.json"

    # Start database (fresh volumes)
    log_info "Starting indexer database..."
    cd "$INDEXER_DIR/generated"
    docker compose down -v 2>/dev/null || true
    docker compose up -d
    sleep 3

    # Run DB migrations
    log_info "Running DB migrations..."
    pnpm db-setup

    # Clear chain progress
    log_info "Clearing chain progress..."
    PGPASSWORD=testing psql -h localhost -p 5433 -U postgres -d envio-dev -c \
        "TRUNCATE TABLE public.persisted_state, public.chain_metadata, public.dynamic_contract_registry CASCADE;" 2>/dev/null || true

    # Re-create symlink
    cd "$INDEXER_DIR"
    rm -rf node_modules/generated 2>/dev/null || true
    ln -sfn ../generated node_modules/generated

    # Start the indexer
    log_info "Starting indexer..."
    cd "$INDEXER_DIR/generated"
    TUI_OFF=true ENVIO_RPC_URL_84532=http://127.0.0.1:$ANVIL_PORT pnpm start &
    INDEXER_PID=$!
    cd "$INDEXER_DIR"
    sleep 5

    log_success "Indexer started (PID: $INDEXER_PID)"

    # Wait for Hasura
    log_info "Waiting for Hasura GraphQL schema..."
    for i in {1..60}; do
        RESULT=$(curl -s "http://localhost:$GRAPHQL_PORT/v1/graphql" \
            -H "Content-Type: application/json" \
            -d '{"query": "{ __schema { types { name } } }"}' 2>/dev/null)
        if echo "$RESULT" | grep -q "Operator"; then
            log_success "Hasura schema is ready!"
            break
        fi
        [[ $((i % 10)) -eq 0 ]] && log_info "Waiting for Hasura schema... ($i/60)"
        sleep 2
    done

    # Give indexer time to sync
    log_info "Giving indexer time to sync from block 0..."
    sleep 15
}

start_activity_generator() {
    log_info "Starting activity generator..."

    # Check if viem is available
    if [[ ! -f "$SCRIPT_DIR/activity-generator.mjs" ]]; then
        log_warn "Activity generator script not found, skipping"
        return
    fi

    # Install viem if needed
    cd "$SCRIPT_DIR"
    if ! npm list viem &>/dev/null; then
        log_info "Installing viem for activity generator..."
        npm install viem 2>/dev/null || true
    fi

    RPC_URL=http://127.0.0.1:$ANVIL_PORT node "$SCRIPT_DIR/activity-generator.mjs" &
    ACTIVITY_PID=$!

    log_success "Activity generator started (PID: $ACTIVITY_PID)"
}

print_status() {
    echo ""
    echo "=========================================="
    log_success "Local environment is running!"
    echo "=========================================="
    echo ""
    echo "Services:"
    echo "  - Anvil RPC:    http://localhost:$ANVIL_PORT"
    echo "  - GraphQL:      http://localhost:$GRAPHQL_PORT/v1/graphql"
    echo ""
    echo "Contract Addresses:"
    echo "  - Tangle:              $TANGLE_PROXY"
    echo "  - MultiAssetDelegation: $RESTAKING_PROXY"
    echo "  - StatusRegistry:       $STATUS_REGISTRY"
    echo ""
    echo "Leaderboard Config (.env.local):"
    echo "  VITE_ENVIO_MAINNET_ENDPOINT=http://localhost:$GRAPHQL_PORT/v1/graphql"
    echo "  VITE_ENVIO_TESTNET_ENDPOINT=http://localhost:$GRAPHQL_PORT/v1/graphql"
    echo ""
    echo "Test Queries:"
    echo "  curl http://localhost:$GRAPHQL_PORT/v1/graphql -H 'Content-Type: application/json' \\"
    echo "    -d '{\"query\": \"{ Operator(limit: 5) { id restakingStake } }\"}'"
    echo ""
    echo "  curl http://localhost:$GRAPHQL_PORT/v1/graphql -H 'Content-Type: application/json' \\"
    echo "    -d '{\"query\": \"{ PointsAccount(limit: 5) { id totalPoints leaderboardPoints } }\"}'"
    echo ""
    echo "Logs:"
    echo "  - Anvil:    anvil output (silent mode)"
    echo "  - Deploy:   cat /tmp/deploy.log"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
}

main() {
    log_info "Starting local leaderboard simulation environment..."

    check_prerequisites
    start_anvil
    deploy_contracts
    start_indexer
    start_activity_generator
    print_status

    # Keep running
    wait
}

main "$@"

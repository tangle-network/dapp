#!/bin/bash
# Start a fully simulatable local environment for dApp development and testing
# Based on tnt-core/scripts/e2e-local.sh
#
# Features an interactive CLI for managing components without full restarts
#
# Usage: ./scripts/local-env/start-local-env.sh
#    or: TNT_CORE_DIR=/path/to/tnt-core ./scripts/local-env/start-local-env.sh

set -euo pipefail

# Configuration
ANVIL_PORT=8545
ANVIL_CHAIN_ID=31337
GRAPHQL_PORT=8080

# Resolve script directory first
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Resolve dapp root (script is in scripts/local-env/)
DAPP_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# TNT_CORE_DIR: default is relative to dapp root (dapp -> webb -> tnt-core)
if [[ -z "${TNT_CORE_DIR:-}" ]]; then
    # Try to find tnt-core as sibling to dapp directory
    if [[ -d "$DAPP_ROOT/../tnt-core" ]]; then
        TNT_CORE_DIR="$DAPP_ROOT/../tnt-core"
    elif [[ -d "$DAPP_ROOT/../../tnt-core" ]]; then
        TNT_CORE_DIR="$DAPP_ROOT/../../tnt-core"
    else
        echo "ERROR: Could not find tnt-core directory. Set TNT_CORE_DIR environment variable."
        echo "  Example: TNT_CORE_DIR=/path/to/tnt-core ./scripts/local-env/start-local-env.sh"
        exit 1
    fi
fi

# Resolve to absolute path
TNT_CORE_DIR="$(cd "$TNT_CORE_DIR" && pwd)"
INDEXER_DIR="$TNT_CORE_DIR/indexer"

# Process IDs (exported for CLI access)
ANVIL_PID=""
INDEXER_PID=""
ACTIVITY_PID=""

# Contract addresses (exported for activity generator)
export TANGLE_PROXY=""
export RESTAKING_PROXY=""
export STATUS_REGISTRY=""
export USDC_ADDRESS=""
export USDT_ADDRESS=""
export DAI_ADDRESS=""
export WETH_ADDRESS=""
export STETH_ADDRESS=""
export WSTETH_ADDRESS=""
export EIGEN_ADDRESS=""

# Colors for output
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
        return 1
    fi

    # Verify contract code exists
    local contract_code=$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "latest"],"id":1}' \
        | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

    if [[ "$contract_code" == "0x" || -z "$contract_code" ]]; then
        log_error "Tangle contract has no code. Deployment may have failed."
        return 1
    fi

    log_info "Deployer nonce: $deployer_nonce"
    log_info "Tangle contract code length: ${#contract_code} chars"

    # Deterministic addresses from Anvil
    export TANGLE_PROXY="0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    export RESTAKING_PROXY="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    export STATUS_REGISTRY="0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"

    # Parse token addresses from deployment log
    log_info "Parsing token addresses from deployment..."
    export USDC_ADDRESS=$(grep "USDC:" /tmp/deploy.log | head -1 | grep -oE '0x[a-fA-F0-9]{40}' || echo "")
    export USDT_ADDRESS=$(grep "USDT:" /tmp/deploy.log | head -1 | grep -oE '0x[a-fA-F0-9]{40}' || echo "")
    export DAI_ADDRESS=$(grep "DAI:" /tmp/deploy.log | head -1 | grep -oE '0x[a-fA-F0-9]{40}' || echo "")
    export WETH_ADDRESS=$(grep "WETH:" /tmp/deploy.log | head -1 | grep -oE '0x[a-fA-F0-9]{40}' || echo "")
    export STETH_ADDRESS=$(grep "stETH:" /tmp/deploy.log | head -1 | grep -oE '0x[a-fA-F0-9]{40}' || echo "")
    export WSTETH_ADDRESS=$(grep "wstETH:" /tmp/deploy.log | head -1 | grep -oE '0x[a-fA-F0-9]{40}' || echo "")
    export EIGEN_ADDRESS=$(grep "EIGEN:" /tmp/deploy.log | head -1 | grep -oE '0x[a-fA-F0-9]{40}' || echo "")

    if [[ -n "$USDC_ADDRESS" ]]; then
        log_success "Token addresses parsed from deployment"
    else
        log_warn "Could not parse token addresses from deployment log"
    fi

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
    TUI_OFF=true ENVIO_RPC_URL_${ANVIL_CHAIN_ID}=http://127.0.0.1:$ANVIL_PORT pnpm start &
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

    # Check if script exists
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

    # Pass all configuration to activity generator
    RPC_URL=http://127.0.0.1:$ANVIL_PORT \
    TANGLE_ADDRESS="$TANGLE_PROXY" \
    RESTAKING_ADDRESS="$RESTAKING_PROXY" \
    STATUS_REGISTRY_ADDRESS="$STATUS_REGISTRY" \
    USDC_ADDRESS="${USDC_ADDRESS:-}" \
    USDT_ADDRESS="${USDT_ADDRESS:-}" \
    DAI_ADDRESS="${DAI_ADDRESS:-}" \
    WETH_ADDRESS="${WETH_ADDRESS:-}" \
    STETH_ADDRESS="${STETH_ADDRESS:-}" \
    WSTETH_ADDRESS="${WSTETH_ADDRESS:-}" \
    EIGEN_ADDRESS="${EIGEN_ADDRESS:-}" \
    node "$SCRIPT_DIR/activity-generator.mjs" &
    ACTIVITY_PID=$!

    log_success "Activity generator started (PID: $ACTIVITY_PID)"
}

stop_activity_generator() {
    if [[ -n "${ACTIVITY_PID:-}" ]]; then
        log_info "Stopping activity generator (PID: $ACTIVITY_PID)..."
        kill "$ACTIVITY_PID" 2>/dev/null || true
        wait "$ACTIVITY_PID" 2>/dev/null || true
        ACTIVITY_PID=""
        log_success "Activity generator stopped"
    else
        log_warn "Activity generator not running"
    fi
}

restart_activity_generator() {
    stop_activity_generator
    sleep 1
    start_activity_generator
}

stop_indexer() {
    if [[ -n "${INDEXER_PID:-}" ]]; then
        log_info "Stopping indexer (PID: $INDEXER_PID)..."
        kill "$INDEXER_PID" 2>/dev/null || true
        wait "$INDEXER_PID" 2>/dev/null || true
        INDEXER_PID=""
        log_success "Indexer stopped"
    else
        log_warn "Indexer not running"
    fi
}

restart_indexer() {
    stop_indexer
    sleep 1

    # Restart just the indexer process, not the full DB setup
    log_info "Restarting indexer..."
    cd "$INDEXER_DIR/generated"
    TUI_OFF=true ENVIO_RPC_URL_${ANVIL_CHAIN_ID}=http://127.0.0.1:$ANVIL_PORT pnpm start &
    INDEXER_PID=$!
    cd "$SCRIPT_DIR"
    log_success "Indexer restarted (PID: $INDEXER_PID)"
}

docker_down() {
    log_info "Running docker compose down..."
    cd "$INDEXER_DIR/generated"
    docker compose down -v 2>/dev/null && log_success "Docker compose down complete" || log_error "Docker compose down failed"
    cd "$SCRIPT_DIR"
}

docker_up() {
    log_info "Running docker compose up..."
    cd "$INDEXER_DIR/generated"
    docker compose up -d 2>/dev/null && log_success "Docker compose up complete" || log_error "Docker compose up failed"
    sleep 3
    # Run migrations
    pnpm db-setup 2>/dev/null || true
    cd "$SCRIPT_DIR"
}

docker_restart() {
    docker_down
    sleep 2
    docker_up
}

show_status() {
    echo ""
    echo -e "${BOLD}=== Environment Status ===${NC}"
    echo ""

    # Check Anvil
    if [[ -n "${ANVIL_PID:-}" ]] && kill -0 "$ANVIL_PID" 2>/dev/null; then
        echo -e "  Anvil:             ${GREEN}Running${NC} (PID: $ANVIL_PID)"
    else
        echo -e "  Anvil:             ${RED}Stopped${NC}"
    fi

    # Check Indexer
    if [[ -n "${INDEXER_PID:-}" ]] && kill -0 "$INDEXER_PID" 2>/dev/null; then
        echo -e "  Indexer:           ${GREEN}Running${NC} (PID: $INDEXER_PID)"
    else
        echo -e "  Indexer:           ${RED}Stopped${NC}"
    fi

    # Check Activity Generator
    if [[ -n "${ACTIVITY_PID:-}" ]] && kill -0 "$ACTIVITY_PID" 2>/dev/null; then
        echo -e "  Activity Gen:      ${GREEN}Running${NC} (PID: $ACTIVITY_PID)"
    else
        echo -e "  Activity Gen:      ${RED}Stopped${NC}"
    fi

    # Check Docker containers
    local docker_status=$(cd "$INDEXER_DIR/generated" && docker compose ps --format "{{.Status}}" 2>/dev/null | head -1)
    if [[ -n "$docker_status" && "$docker_status" == *"Up"* ]]; then
        echo -e "  Docker:            ${GREEN}Running${NC}"
    else
        echo -e "  Docker:            ${RED}Stopped${NC}"
    fi

    echo ""
    echo "Services:"
    echo "  - Anvil RPC:    http://localhost:$ANVIL_PORT"
    echo "  - GraphQL:      http://localhost:$GRAPHQL_PORT/v1/graphql"
    echo ""
}

show_addresses() {
    echo ""
    echo -e "${BOLD}=== Contract Addresses ===${NC}"
    echo ""
    echo "Core Contracts:"
    echo "  - Tangle:              ${TANGLE_PROXY:-Not deployed}"
    echo "  - MultiAssetDelegation: ${RESTAKING_PROXY:-Not deployed}"
    echo "  - StatusRegistry:       ${STATUS_REGISTRY:-Not deployed}"
    echo ""
    echo "Token Addresses:"
    [[ -n "${USDC_ADDRESS:-}" ]] && echo "  - USDC:   $USDC_ADDRESS"
    [[ -n "${USDT_ADDRESS:-}" ]] && echo "  - USDT:   $USDT_ADDRESS"
    [[ -n "${DAI_ADDRESS:-}" ]] && echo "  - DAI:    $DAI_ADDRESS"
    [[ -n "${WETH_ADDRESS:-}" ]] && echo "  - WETH:   $WETH_ADDRESS"
    [[ -n "${STETH_ADDRESS:-}" ]] && echo "  - stETH:  $STETH_ADDRESS"
    [[ -n "${WSTETH_ADDRESS:-}" ]] && echo "  - wstETH: $WSTETH_ADDRESS"
    [[ -n "${EIGEN_ADDRESS:-}" ]] && echo "  - EIGEN:  $EIGEN_ADDRESS"
    [[ -z "${USDC_ADDRESS:-}" ]] && echo "  (No tokens deployed)"
    echo ""
}

show_accounts() {
    echo ""
    echo -e "${BOLD}=== Development Accounts (Anvil Default) ===${NC}"
    echo ""
    echo -e "${YELLOW}Each account has 10,000 ETH + ERC20 tokens for testing${NC}"
    echo ""
    echo -e "${CYAN}Account #0 (Deployer):${NC}"
    echo "  Address:     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    echo "  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    echo ""
    echo -e "${CYAN}Account #1:${NC}"
    echo "  Address:     0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    echo "  Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    echo ""
    echo -e "${CYAN}Account #2:${NC}"
    echo "  Address:     0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    echo "  Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
    echo ""
    echo -e "${CYAN}Account #3:${NC}"
    echo "  Address:     0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    echo "  Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
    echo ""
    echo -e "${CYAN}Account #4:${NC}"
    echo "  Address:     0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
    echo "  Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
    echo ""
    echo -e "${CYAN}Account #5:${NC}"
    echo "  Address:     0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
    echo "  Private Key: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"
    echo ""
    echo -e "${CYAN}Account #6:${NC}"
    echo "  Address:     0x976EA74026E726554dB657fA54763abd0C3a0aa9"
    echo "  Private Key: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"
    echo ""
    echo -e "${CYAN}Account #7:${NC}"
    echo "  Address:     0x14dC79964da2C08b23698B3D3cc7Ca32193d9955"
    echo "  Private Key: 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356"
    echo ""
    echo -e "${CYAN}Account #8:${NC}"
    echo "  Address:     0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f"
    echo "  Private Key: 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97"
    echo ""
    echo -e "${CYAN}Account #9:${NC}"
    echo "  Address:     0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"
    echo "  Private Key: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"
    echo ""
}

show_logs() {
    local component="${1:-}"
    case "$component" in
        deploy|contracts)
            echo -e "${BOLD}=== Deployment Log (last 50 lines) ===${NC}"
            tail -50 /tmp/deploy.log 2>/dev/null || echo "No deployment log found"
            ;;
        *)
            echo "Usage: logs <deploy|contracts>"
            ;;
    esac
}

clear_indexer_state() {
    log_info "Clearing indexer state..."
    rm -f "$INDEXER_DIR/generated/persisted_state.envio.json"

    PGPASSWORD=testing psql -h localhost -p 5433 -U postgres -d envio-dev -c \
        "TRUNCATE TABLE public.persisted_state, public.chain_metadata, public.dynamic_contract_registry CASCADE;" 2>/dev/null || true

    log_success "Indexer state cleared. Restart indexer to re-sync from block 0."
}

print_help() {
    echo ""
    echo -e "${BOLD}=== Local Environment CLI ===${NC}"
    echo ""
    echo -e "${CYAN}Activity Generator:${NC}"
    echo "  activity restart    - Restart the activity generator"
    echo "  activity stop       - Stop the activity generator"
    echo "  activity start      - Start the activity generator"
    echo ""
    echo -e "${CYAN}Indexer:${NC}"
    echo "  indexer restart     - Restart the indexer process"
    echo "  indexer stop        - Stop the indexer"
    echo "  indexer clear       - Clear indexer state (then restart to re-sync)"
    echo ""
    echo -e "${CYAN}Docker:${NC}"
    echo "  docker down         - Run docker compose down -v"
    echo "  docker up           - Run docker compose up -d"
    echo "  docker restart      - Restart docker containers"
    echo ""
    echo -e "${CYAN}Info:${NC}"
    echo "  status              - Show status of all components"
    echo "  addresses           - Show contract addresses"
    echo "  accounts            - Show development accounts with private keys"
    echo "  logs deploy         - Show deployment logs"
    echo ""
    echo -e "${CYAN}Other:${NC}"
    echo "  help                - Show this help"
    echo "  quit, exit, q       - Exit and cleanup"
    echo ""
}

print_startup_banner() {
    echo ""
    echo "=========================================="
    log_success "Local environment is running!"
    echo "=========================================="
    echo ""
    echo "Services:"
    echo "  - Anvil RPC:    http://localhost:$ANVIL_PORT (Chain ID: $ANVIL_CHAIN_ID)"
    echo "  - GraphQL:      http://localhost:$GRAPHQL_PORT/v1/graphql"
    echo ""
    echo "dApp Config (.env.local):"
    echo "  VITE_ENVIO_MAINNET_ENDPOINT=http://localhost:$GRAPHQL_PORT/v1/graphql"
    echo "  VITE_ENVIO_TESTNET_ENDPOINT=http://localhost:$GRAPHQL_PORT/v1/graphql"
    echo ""
    echo -e "${BOLD}Development Accounts (10 accounts with 10,000 ETH + ERC20 tokens):${NC}"
    echo "  #0 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Deployer)"
    echo "  #1 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    echo "  #2 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    echo -e "  ${CYAN}...type 'accounts' for all 10 with private keys${NC}"
    echo ""
    echo -e "${YELLOW}Type 'help' for available commands${NC}"
    echo ""
}

interactive_cli() {
    print_startup_banner

    while true; do
        echo -ne "${CYAN}local-env>${NC} "
        read -r cmd args || break

        case "$cmd" in
            # Activity generator commands
            activity)
                case "$args" in
                    restart) restart_activity_generator ;;
                    stop) stop_activity_generator ;;
                    start) start_activity_generator ;;
                    *) echo "Usage: activity <restart|stop|start>" ;;
                esac
                ;;

            # Indexer commands
            indexer)
                case "$args" in
                    restart) restart_indexer ;;
                    stop) stop_indexer ;;
                    clear) clear_indexer_state ;;
                    *) echo "Usage: indexer <restart|stop|clear>" ;;
                esac
                ;;

            # Docker commands
            docker)
                case "$args" in
                    down) docker_down ;;
                    up) docker_up ;;
                    restart) docker_restart ;;
                    *) echo "Usage: docker <down|up|restart>" ;;
                esac
                ;;

            # Info commands
            status) show_status ;;
            addresses) show_addresses ;;
            accounts) show_accounts ;;
            logs) show_logs "$args" ;;
            help|h|\?) print_help ;;

            # Exit commands
            quit|exit|q)
                log_info "Exiting..."
                break
                ;;

            # Empty input
            "") ;;

            # Unknown command
            *)
                echo "Unknown command: $cmd"
                echo "Type 'help' for available commands"
                ;;
        esac
    done
}

main() {
    log_info "Starting local development environment..."

    check_prerequisites
    start_anvil
    deploy_contracts
    start_indexer
    start_activity_generator

    # Check if running in an interactive terminal
    if [[ -t 0 ]]; then
        # Interactive mode - enter CLI
        interactive_cli
    else
        # Non-interactive mode - just keep running
        print_startup_banner
        log_info "Running in non-interactive mode. Press Ctrl+C to stop."
        log_info "For interactive CLI, run script directly in a terminal (not with output redirection)."

        # Wait forever (until Ctrl+C triggers cleanup)
        while true; do
            sleep 60
        done
    fi
}

main "$@"

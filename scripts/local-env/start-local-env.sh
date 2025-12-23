#!/bin/bash
# Start a fully simulatable local environment for dApp development and testing
# Based on tnt-core/scripts/e2e-local.sh
#
# Features an interactive CLI for managing components without full restarts
#
# Usage:
#   ./scripts/local-env/start-local-env.sh          # Full setup (deploys contracts, starts everything)
#   ./scripts/local-env/start-local-env.sh resume   # Resume existing session (fast, ~5 seconds)
#   ./scripts/local-env/start-local-env.sh clean    # Clean all cached state and start fresh
#
# Environment variables:
#   TNT_CORE_DIR=/path/to/tnt-core  # Override tnt-core directory location
#   ANVIL_STATE_INTERVAL=5          # Seconds between automatic state snapshots (default: 5)

set -euo pipefail

# Parse command line arguments
RESUME_MODE=false
CLEAN_MODE=false
case "${1:-}" in
    resume|r)
        RESUME_MODE=true
        ;;
    clean|c)
        CLEAN_MODE=true
        ;;
    help|--help|-h)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (none)    Full setup - deploy contracts, start all services (~2 min)"
        echo "  resume    Resume session - reconnects to running Anvil/Docker (~5 sec)"
        echo "            Note: If Anvil isn't running, it will be started from the last snapshot"
        echo "  clean     Clean cached addresses and start completely fresh"
        echo "  help      Show this help message"
        echo ""
        echo "Workflow:"
        echo "  1. Run '$0' for initial setup"
        echo "  2. Exit the CLI (Anvil state is snapshotted periodically)"
        echo "  3. Run '$0 resume' to reconnect quickly"
        exit 0
        ;;
esac

# Configuration
ANVIL_PORT=8545
ANVIL_CHAIN_ID=31337
HASURA_EXTERNAL_PORT="${HASURA_EXTERNAL_PORT:-8080}"
GRAPHQL_PORT="$HASURA_EXTERNAL_PORT"
CLAIM_RELAYER_PORT=${CLAIM_RELAYER_PORT:-3001}
ANVIL_STATE_INTERVAL="${ANVIL_STATE_INTERVAL:-5}"
# Anvil's default deployer private key (account #0)
ANVIL_PRIVATE_KEY="${ANVIL_PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"

# Claim relayer defaults (Anvil account #1 unless overridden)
DEFAULT_RELAYER_PRIVATE_KEY="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
CLAIM_RELAYER_PRIVATE_KEY="${CLAIM_RELAYER_PRIVATE_KEY:-$DEFAULT_RELAYER_PRIVATE_KEY}"
CLAIM_RELAYER_PID=""
CLAIM_RELAYER_LOG="/tmp/claim-relayer.log"

# Envio ports
# - Postgres defaults to 5433 (matches docker-compose.yml default)
# - Indexer server (metrics/console) defaults to 9898 (matches Envio default)
ENVIO_PG_PORT="${ENVIO_PG_PORT:-5433}"
ENVIO_INDEXER_PORT="${ENVIO_INDEXER_PORT:-9898}"
METRICS_PORT="${METRICS_PORT:-$ENVIO_INDEXER_PORT}"
ENVIO_PG_USER="${ENVIO_PG_USER:-postgres}"
ENVIO_PG_PASSWORD="${ENVIO_PG_PASSWORD:-testing}"
ENVIO_PG_DATABASE="${ENVIO_PG_DATABASE:-envio-dev}"
USER_PROVIDED_WIPE_DOCKER_VOLUMES=false
USER_PROVIDED_CLEAN_DOCKER=false
if [[ -n "${WIPE_DOCKER_VOLUMES+x}" ]]; then
    USER_PROVIDED_WIPE_DOCKER_VOLUMES=true
fi
if [[ -n "${CLEAN_DOCKER+x}" ]]; then
    USER_PROVIDED_CLEAN_DOCKER=true
fi
WIPE_DOCKER_VOLUMES="${WIPE_DOCKER_VOLUMES:-false}"
CLEAN_DOCKER="${CLEAN_DOCKER:-false}"
STRICT_INDEXER_PORT="${STRICT_INDEXER_PORT:-false}"
STRICT_PG_PORT="${STRICT_PG_PORT:-false}"
STRICT_HASURA_PORT="${STRICT_HASURA_PORT:-false}"
export ENVIO_PG_PORT ENVIO_INDEXER_PORT METRICS_PORT ENVIO_PG_USER ENVIO_PG_PASSWORD ENVIO_PG_DATABASE HASURA_EXTERNAL_PORT

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
export REWARD_VAULTS_ADDRESS=""
export INFLATION_POOL_ADDRESS=""
# Migration contract addresses
export TANGLE_MIGRATION_ADDRESS=""
export TNT_TOKEN_ADDRESS=""
export TNT_TOKEN=""
export MIGRATION_TNT_TOKEN_ADDRESS=""

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

ensure_docker_running() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon is not responding (Docker Desktop may be crashed or starting)."
        log_info "Open Docker Desktop and wait for it to be 'Running', then rerun."
        exit 1
    fi
}

port_has_listener_with_pattern() {
    local port="$1"
    local pattern="$2"

    local pids
    pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
    if [[ -z "$pids" ]]; then
        return 1
    fi

    for pid in $pids; do
        local cmd
        cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
        if [[ "$cmd" == *"$pattern"* ]]; then
            return 0
        fi
    done

    return 1
}

kill_port_listeners() {
    local port="$1"
    local label="${2:-port}"
    local pattern="${3:-}"

    local pids
    pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
    if [[ -z "$pids" ]]; then
        return 0
    fi

    local blocked_by_other=false
    local blocking_details=""
    local kill_pids=""

    for pid in $pids; do
        local cmd
        cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
        if [[ -n "$pattern" && "$cmd" != *"$pattern"* ]]; then
            blocked_by_other=true
            blocking_details="PID $pid: $cmd"
            continue
        fi

        kill_pids="$kill_pids $pid"
    done

    if [[ "$blocked_by_other" == "true" ]]; then
        log_warn "$label port $port is in use by a non-$pattern process and will NOT be killed:"
        log_warn "  $blocking_details"
        return 1
    fi

    log_warn "$label port $port is in use; attempting cleanup..."

    for pid in $kill_pids; do
        local cmd
        cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
        log_warn "Killing PID $pid listening on $port ($cmd)"
        kill -TERM "$pid" 2>/dev/null || true
    done

    sleep 0.5

    pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then
        for pid in $pids; do
            kill -KILL "$pid" 2>/dev/null || true
        done
    fi
}

is_port_free() {
    local port="$1"
    [[ -z "$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)" ]]
}

ensure_free_postgres_port() {
    local start_port="$ENVIO_PG_PORT"

    for offset in {0..50}; do
        local port=$((start_port + offset))
        if is_port_free "$port"; then
            ENVIO_PG_PORT="$port"
            export ENVIO_PG_PORT
            return 0
        fi

        if [[ "$STRICT_PG_PORT" == "true" ]]; then
            log_error "ENVIO_PG_PORT=$start_port is not available and STRICT_PG_PORT=true"
            return 1
        fi
    done

    log_error "Could not find a free Postgres port near $start_port"
    return 1
}

ensure_free_hasura_port() {
    local start_port="$HASURA_EXTERNAL_PORT"

    for offset in {0..50}; do
        local port=$((start_port + offset))
        if is_port_free "$port"; then
            HASURA_EXTERNAL_PORT="$port"
            GRAPHQL_PORT="$port"
            export HASURA_EXTERNAL_PORT
            return 0
        fi

        if [[ "$STRICT_HASURA_PORT" == "true" ]]; then
            log_error "HASURA_EXTERNAL_PORT=$start_port is not available and STRICT_HASURA_PORT=true"
            return 1
        fi
    done

    log_error "Could not find a free Hasura port near $start_port"
    return 1
}

sync_ports_from_docker_compose() {
    # Must be called from inside $INDEXER_DIR/generated
    local pg_mapping
    local hasura_mapping

    pg_mapping="$(docker compose port envio-postgres 5432 2>/dev/null | head -1 || true)"
    hasura_mapping="$(docker compose port graphql-engine 8080 2>/dev/null | head -1 || true)"

    if [[ -n "$pg_mapping" ]]; then
        local pg_port
        pg_port="$(echo "$pg_mapping" | sed -E 's/.*:([0-9]+)$/\\1/')"
        if [[ "$pg_port" =~ ^[0-9]+$ ]]; then
            ENVIO_PG_PORT="$pg_port"
            export ENVIO_PG_PORT
        fi
    fi

    if [[ -n "$hasura_mapping" ]]; then
        local hasura_port
        hasura_port="$(echo "$hasura_mapping" | sed -E 's/.*:([0-9]+)$/\\1/')"
        if [[ "$hasura_port" =~ ^[0-9]+$ ]]; then
            HASURA_EXTERNAL_PORT="$hasura_port"
            GRAPHQL_PORT="$hasura_port"
            export HASURA_EXTERNAL_PORT
        fi
    fi
}

ensure_postgres_password() {
    if ! command -v psql >/dev/null 2>&1; then
        log_warn "psql is not installed; attempting to reset postgres password inside the container..."

        ensure_docker_running
        cd "$INDEXER_DIR/generated"

        # This typically works because local socket auth inside the container is trust.
        if docker compose exec -T envio-postgres psql -U "$ENVIO_PG_USER" -d postgres -c "ALTER USER $ENVIO_PG_USER WITH PASSWORD '$ENVIO_PG_PASSWORD';" >/dev/null 2>&1; then
            log_success "Reset postgres password inside container"
            POSTGRES_PASSWORD_RESET=true
            return 0
        fi

        log_error "Failed to reset postgres password inside container."
        log_info "If this is a persisted volume from a different setup, run:"
        log_info "  WIPE_DOCKER_VOLUMES=true ./scripts/local-env/start-local-env.sh clean"
        exit 1
    fi

    # If we can already connect from host, we're good.
    if PGPASSWORD="$ENVIO_PG_PASSWORD" psql -h localhost -p "$ENVIO_PG_PORT" -U "$ENVIO_PG_USER" -d "$ENVIO_PG_DATABASE" -c "SELECT 1;" >/dev/null 2>&1; then
        return 0
    fi

    log_warn "Host Postgres auth failed; attempting to reset postgres password inside the container..."

    ensure_docker_running
    cd "$INDEXER_DIR/generated"

    # This typically works because local socket auth inside the container is trust.
    if docker compose exec -T envio-postgres psql -U "$ENVIO_PG_USER" -d postgres -c "ALTER USER $ENVIO_PG_USER WITH PASSWORD '$ENVIO_PG_PASSWORD';" >/dev/null 2>&1; then
        log_success "Reset postgres password inside container"
        POSTGRES_PASSWORD_RESET=true
    else
        log_error "Failed to reset postgres password inside container."
        log_info "If this is a persisted volume from a different setup, run:"
        log_info "  CLEAN_DOCKER=true WIPE_DOCKER_VOLUMES=true ./scripts/local-env/start-local-env.sh clean"
        exit 1
    fi

    # Re-test from host.
    if ! PGPASSWORD="$ENVIO_PG_PASSWORD" psql -h localhost -p "$ENVIO_PG_PORT" -U "$ENVIO_PG_USER" -d "$ENVIO_PG_DATABASE" -c "SELECT 1;" >/dev/null 2>&1; then
        log_error "Postgres is still not reachable with the configured credentials."
        exit 1
    fi
}

wait_for_postgres() {
    log_info "Waiting for Postgres to be ready..."
    for i in {1..30}; do
        if docker compose exec -T envio-postgres pg_isready -U "$ENVIO_PG_USER" >/dev/null 2>&1; then
            log_success "Postgres is ready"
            return 0
        fi
        [[ $((i % 5)) -eq 0 ]] && log_info "Waiting for Postgres... ($i/30)"
        sleep 1
    done
    log_error "Postgres did not become ready in time"
    return 1
}

ensure_free_indexer_port() {
    local start_port="$ENVIO_INDEXER_PORT"

    for offset in {0..20}; do
        local port=$((start_port + offset))

        if is_port_free "$port"; then
            ENVIO_INDEXER_PORT="$port"
            METRICS_PORT="$port"
            export ENVIO_INDEXER_PORT METRICS_PORT
            return 0
        fi

        # Only attempt to kill if it actually looks like the stale indexer.
        if port_has_listener_with_pattern "$port" "ts-node"; then
            if kill_port_listeners "$port" "Envio indexer" "ts-node"; then
                if is_port_free "$port"; then
                    ENVIO_INDEXER_PORT="$port"
                    METRICS_PORT="$port"
                    export ENVIO_INDEXER_PORT METRICS_PORT
                    return 0
                fi
            fi
        fi

        if [[ "$STRICT_INDEXER_PORT" == "true" ]]; then
            log_error "ENVIO_INDEXER_PORT=$start_port is not available and STRICT_INDEXER_PORT=true"
            return 1
        fi
    done

    log_error "Could not find a free indexer port near $start_port"
    return 1
}

cleanup() {
    log_info "Cleaning up..."

    # Kill indexer and activity generator (they depend on Anvil/Docker)
    [[ -n "${INDEXER_PID:-}" ]] && kill "$INDEXER_PID" 2>/dev/null || true
    [[ -n "${ACTIVITY_PID:-}" ]] && kill "$ACTIVITY_PID" 2>/dev/null || true
    [[ -n "${CLAIM_RELAYER_PID:-}" ]] && kill "$CLAIM_RELAYER_PID" 2>/dev/null || true
    kill_port_listeners "$ENVIO_INDEXER_PORT" "Envio indexer" "ts-node" || true

    # Keep Anvil and Docker running for resume mode
    # To fully stop everything, use 'docker compose down' and kill Anvil manually
    log_info "Anvil and Docker containers left running for resume mode"
    log_info "To fully stop: kill Anvil (port $ANVIL_PORT) and run 'docker compose down' in indexer/generated"
    log_info "Cleanup complete"
}
trap cleanup EXIT

# Kill any leftover processes (skip in resume mode)
if [[ "$RESUME_MODE" != "true" ]]; then
    pkill -f "ts-node src/Index" 2>/dev/null || true
    lsof -ti:$ANVIL_PORT | xargs kill 2>/dev/null || true
    sleep 1
fi

check_prerequisites() {
    log_info "Checking prerequisites..."

    command -v anvil &>/dev/null || { log_error "anvil not found. Install Foundry: https://getfoundry.sh"; exit 1; }
    command -v forge &>/dev/null || { log_error "forge not found. Install Foundry: https://getfoundry.sh"; exit 1; }
    command -v docker &>/dev/null || { log_error "docker not found. Install Docker"; exit 1; }
    command -v pnpm &>/dev/null || { log_error "pnpm not found. Install pnpm"; exit 1; }

    ensure_docker_running

    [[ -d "$TNT_CORE_DIR" ]] || { log_error "TNT_CORE_DIR not found: $TNT_CORE_DIR"; exit 1; }
    [[ -d "$INDEXER_DIR" ]] || { log_error "Indexer directory not found: $INDEXER_DIR"; exit 1; }

    log_success "All prerequisites met"
    log_info "TNT_CORE_DIR: $TNT_CORE_DIR"
}

# Cache file locations
CACHE_DIR="/tmp/local-env-cache"
ADDRESSES_CACHE="$CACHE_DIR/addresses.env"
ANVIL_STATE_FILE="$CACHE_DIR/anvil-state.json"

is_anvil_running() {
    curl -s "http://127.0.0.1:$ANVIL_PORT" -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' > /dev/null 2>&1
}

start_anvil() {
    local mode="${1:-fresh}" # fresh|resume
    log_info "Starting Anvil on port $ANVIL_PORT..."

    mkdir -p "$CACHE_DIR"

    local state_args=()
    if [[ "$mode" == "resume" ]]; then
        if [[ ! -f "$ANVIL_STATE_FILE" ]]; then
            log_error "No Anvil state snapshot found at $ANVIL_STATE_FILE"
            log_info "Run without 'resume' to deploy a fresh local environment."
            exit 1
        fi

        state_args=(--state "$ANVIL_STATE_FILE" --state-interval "$ANVIL_STATE_INTERVAL")
    else
        # Start from a clean chain; keep writing snapshots so resume can restart even if Anvil stops.
        rm -f "$ANVIL_STATE_FILE" 2>/dev/null || true
        state_args=(--dump-state "$ANVIL_STATE_FILE" --state-interval "$ANVIL_STATE_INTERVAL")
    fi

    anvil --chain-id $ANVIL_CHAIN_ID --port $ANVIL_PORT --block-time 1 --base-fee 0 --gas-limit 30000000 --disable-code-size-limit "${state_args[@]}" --silent &
    ANVIL_PID=$!
    sleep 2

    if ! is_anvil_running; then
        log_error "Failed to start Anvil"
        exit 1
    fi

    log_success "Anvil started (PID: $ANVIL_PID)"

    # Deploy Multicall3 contract at the standard address (needed for viem multicall)
    deploy_multicall3
}

deploy_multicall3() {
    local MULTICALL3_ADDRESS="0xcA11bde05977b3631167028862bE2a173976CA11"

    # Check if already deployed
    local response=$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
        --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$MULTICALL3_ADDRESS\", \"latest\"],\"id\":1}")
    local code=$(echo "$response" | sed -n 's/.*"result":"\([^"]*\)".*/\1/p')

    if [[ "$code" != "0x" && -n "$code" && ${#code} -gt 10 ]]; then
        # aggregate3((address,bool,bytes)[]) selector = 0x82ad56cb
        # abi.encode(empty array) = offset(0x20) + length(0)
        local probe="0x82ad56cb00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"
        local probe_resp
        probe_resp=$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$MULTICALL3_ADDRESS\",\"data\":\"$probe\"},\"latest\"],\"id\":1}")

        if echo "$probe_resp" | grep -q '"result"'; then
            log_info "Multicall3 already deployed at $MULTICALL3_ADDRESS"
            return 0
        fi

        log_warn "Multicall3 code present but not functional; re-injecting runtime bytecode..."
    fi

    log_info "Deploying Multicall3 at $MULTICALL3_ADDRESS..."

    # Multicall3 deployed bytecode (verified from Etherscan)
    # Using a minimal subset that includes aggregate3 function
    local MULTICALL3_BYTECODE="0x6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e1461025a578063bce38bd714610275578063c3077fa914610288578063ee82ac5e1461029b57600080fd5b80634d2301cc146101ec57806372425d9d1461022157806382ad56cb1461023457806386d516e81461024757600080fd5b80633408e470116100c65780633408e47014610191578063399542e9146101a45780633e64a696146101c657806342cbb15c146101d957600080fd5b80630f28c97d146100f8578063174dea711461011a578063252dba421461013a57806327e86d6e1461015b575b600080fd5b34801561010457600080fd5b50425b6040519081526020015b60405180910390f35b61012d610128366004610a85565b6102ba565b6040516101119190610bbe565b61014d610148366004610a85565b6104ef565b604051610111929190610bd8565b34801561016757600080fd5b50437fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0140610107565b34801561019d57600080fd5b5046610107565b6101b76101b2366004610c60565b610690565b60405161011193929190610cba565b3480156101d257600080fd5b5048610107565b3480156101e557600080fd5b5043610107565b3480156101f857600080fd5b50610107610207366004610ce2565b73ffffffffffffffffffffffffffffffffffffffff163190565b34801561022d57600080fd5b5044610107565b61012d610242366004610a85565b6106ab565b34801561025357600080fd5b5045610107565b34801561026657600080fd5b50604051418152602001610111565b61012d610283366004610c60565b61085a565b6101b7610296366004610a85565b610a1a565b3480156102a757600080fd5b506101076102b6366004610d18565b4090565b60606000828067ffffffffffffffff8111156102d8576102d8610d31565b60405190808252806020026020018201604052801561031e57816020015b6040805180820190915260008152606060208201528152602001906001900390816102f65790505b5092503660005b8281101561047757600085828151811061034157610341610d60565b6020026020010151905087878381811061035d5761035d610d60565b905060200281019061036f9190610d8f565b6040810135958601959093506103886020850185610ce2565b73ffffffffffffffffffffffffffffffffffffffff16816103ac6060870187610dcd565b6040516103ba929190610e32565b60006040518083038185875af1925050503d80600081146103f7576040519150601f19603f3d011682016040523d82523d6000602084013e6103fc565b606091505b50602080850191909152901515808452908501351761046d577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b5050600101610325565b508234146104e6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601a60248201527f4d756c746963616c6c333a2076616c7565206d69736d6174636800000000000060448201526064015b60405180910390fd5b50505092915050565b436000819003610528576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f4d756c746963616c6c333a206e6f20626c6f636b73000000000000000000000060448201526064016104dd565b804060606105368686610690565b9196509450925050509250925092565b60008060005b8381101561068957600085828151811061056857610568610d60565b6020026020010151905080600001511561060f578060200151805190602001208360405160200161059d929190918252602082015260400190565b60405160208183030381529060405280519060200120925060005b60018160ff161015610609576040805160208101859052908101849052606001604051602081830303815290604052805190602001209250806105fa81610e42565b9150506105b8565b50610674565b8060200151805190602001208360405160200161063c929190918252606082811b7fffffffffffffffffffffffffffffffffffffffff00000000000000000000000016602084015260340190565b60405160208183030381529060405280519060200120925060005b60018160ff161015610609578360405160200161067691815260200190565b60405160208183030381529060405280519060200120925080610698565b600101610574565b5050919050565b600080606061069f86866102ba565b91509150935093915050565b60606000828067ffffffffffffffff8111156106c9576106c9610d31565b60405190808252806020026020018201604052801561070f57816020015b6040805180820190915260008152606060208201528152602001906001900390816106e75790505b5092503660005b828110156104e657600085828151811061073257610732610d60565b6020026020010151905087878381811061074e5761074e610d60565b90506020028101906107609190610d8f565b6040810135958601959093506107796020850185610ce2565b73ffffffffffffffffffffffffffffffffffffffff168161079d6060870187610dcd565b6040516107ab929190610e32565b6000604051808303816000865af19150503d80600081146107e8576040519150601f19603f3d011682016040523d82523d6000602084013e6107ed565b606091505b50602083015215158082528301351761084d577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b5050600101610716565b60606000828067ffffffffffffffff81111561087857610878610d31565b6040519080825280602002602001820160405280156108be57816020015b6040805180820190915260008152606060208201528152602001906001900390816108965790505b5092503660005b82811015610a105760008582815181106108e1576108e1610d60565b602002602001015190508787838181106108fd576108fd610d60565b905060200281019061090f9190610e61565b6040810135958601959093506109286020850185610ce2565b73ffffffffffffffffffffffffffffffffffffffff168161094c6060870187610dcd565b60405161095a929190610e32565b6000604051808303816000865af19150503d8060008114610997576040519150601f19603f3d011682016040523d82523d6000602084013e61099c565b606091505b50602083015215158082528335176109fe577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b50508060010190506108c5565b5050509392505050565b6000806060610a298686610690565b915091509250929050565b60008060208385031215610a4757600080fd5b823567ffffffffffffffff80821115610a5f57600080fd5b818501915085601f830112610a7357600080fd5b813581811115610a8257600080fd5b8660208260051b8501011115610a9757600080fd5b60209290920196919550909350505050565b60005b83811015610ac4578181015183820152602001610aac565b50506000910152565b60008151808452610ae5816020860160208601610aa9565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b600082825180855260208086019550808260051b84010181860160005b84811015610b5a57601f19868403018952610b50838351610acd565b98840198925090830190600101610b34565b5090979650505050505050565b602081526000610b7a6020830184610b17565b9392505050565b600060408201848352602060408185015281855180845260608601915060608160051b870101935082870160005b82811015610bfb577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa0888703018452610be9868351610acd565b95509284019290840190600101610baf565b509398975050505050505050565b60008060408385031215610c1c57600080fd5b823567ffffffffffffffff811115610c3357600080fd5b8301601f81018513610c4457600080fd5b803560208201602082011115610c5957600080fd5b8082529150509250929050565b838152826020820152606060408201526000610c856060830184610b17565b95945050505050565b600060208284031215610ca057600080fd5b813573ffffffffffffffffffffffffffffffffffffffff81168114610b7a57600080fd5b600060208284031215610cd657600080fd5b5035919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81833603018112610d7157600080fd5b9190910192915050565b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe1843603018112610db057600080fd5b83018035915067ffffffffffffffff821115610dcb57600080fd5b602001915036819003821315610de057600080fd5b9250929050565b8183823760009101908152919050565b600060ff821660ff8103610e34577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60010192915050565b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff41833603018112610d7157600080fdfea26469706673582212209ed684b41fe207ca7ea1bbf5b2b5e90e28af7ec8e9be42ebc5f8c6dcb76e1d9364736f6c63430008120033"

    local DEFAULT_MULTICALL3_BYTECODE="$MULTICALL3_BYTECODE"

    # Prefer the canonical Multicall3 runtime bytecode from tnt-core when available.
    # This avoids silently persisting a bad/broken Multicall3 across Anvil snapshots.
    if [[ -f "$TNT_CORE_DIR/scripts/local-env/start-local-env.sh" ]]; then
        local core_multicall_bytecode=""
	        core_multicall_bytecode="$(
	            python3 - "$TNT_CORE_DIR/scripts/local-env/start-local-env.sh" <<-'PY' 2>/dev/null || true
	import re, sys
	text = open(sys.argv[1], "r", encoding="utf-8").read()
	# Support both older "local MULTICALL3_BYTECODE=..." and the current heredoc format used by tnt-core.
	m = re.search(r'local\s+MULTICALL3_BYTECODE="(0x[0-9a-fA-F]+)"', text)
	if m:
	    print(m.group(1))
	    raise SystemExit(0)
	m = re.search(r"MULTICALL3_BYTECODE=\"\$\(\s*cat <<'EOF'\n(.*?)\n\s*EOF\n\s*\)\"", text, re.S)
	if m:
	    code = ''.join(line.strip() for line in m.group(1).splitlines())
	    print(code)
	    raise SystemExit(0)
	print("")
	PY
	        )"

        if [[ -n "$core_multicall_bytecode" ]]; then
            MULTICALL3_BYTECODE="$core_multicall_bytecode"
        fi
    fi

    # Normalize and validate bytecode.
    MULTICALL3_BYTECODE="${MULTICALL3_BYTECODE//$'\n'/}"
    MULTICALL3_BYTECODE="${MULTICALL3_BYTECODE//[[:space:]]/}"
    if [[ ! "$MULTICALL3_BYTECODE" =~ ^0x[0-9a-fA-F]+$ ]] || (( (${#MULTICALL3_BYTECODE} - 2) % 2 != 0 )); then
        log_warn "Invalid Multicall3 bytecode; continuing without multicall"
        return 0
    fi

    # Use anvil_setCode to deploy at the deterministic address
    local set_result=$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
        --data "{\"jsonrpc\":\"2.0\",\"method\":\"anvil_setCode\",\"params\":[\"$MULTICALL3_ADDRESS\", \"$MULTICALL3_BYTECODE\"],\"id\":1}")

    # If the tnt-core bytecode is malformed (e.g., odd-length hex), retry with embedded fallback.
    if echo "$set_result" | grep -q '"error"' && [[ "$MULTICALL3_BYTECODE" != "$DEFAULT_MULTICALL3_BYTECODE" ]]; then
        log_warn "anvil_setCode failed with tnt-core Multicall3 bytecode; retrying with embedded fallback..."
        MULTICALL3_BYTECODE="$DEFAULT_MULTICALL3_BYTECODE"
        MULTICALL3_BYTECODE="${MULTICALL3_BYTECODE//$'\n'/}"
        MULTICALL3_BYTECODE="${MULTICALL3_BYTECODE//[[:space:]]/}"
        set_result=$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"anvil_setCode\",\"params\":[\"$MULTICALL3_ADDRESS\", \"$MULTICALL3_BYTECODE\"],\"id\":1}")
    fi
    if echo "$set_result" | grep -q '"error"'; then
        log_warn "Multicall3 injection failed; continuing without multicall (response: $set_result)"
        return 0
    fi

    # Small delay for Anvil to process
    sleep 0.5

    # Verify deployment
    response=$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
        --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$MULTICALL3_ADDRESS\", \"latest\"],\"id\":1}")
    code=$(echo "$response" | sed -n 's/.*"result":"\([^"]*\)".*/\1/p')

    if [[ "$code" != "0x" && -n "$code" && ${#code} -gt 10 ]]; then
        # Confirm it's functional.
        local probe="0x82ad56cb00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"
        local probe_resp
        probe_resp=$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$MULTICALL3_ADDRESS\",\"data\":\"$probe\"},\"latest\"],\"id\":1}")

        if echo "$probe_resp" | grep -q '"result"'; then
            log_success "Multicall3 deployed at $MULTICALL3_ADDRESS"
        else
            log_warn "Multicall3 injected but not functional; continuing without multicall (response: $probe_resp)"
            return 0
        fi
    else
        log_warn "Failed to deploy Multicall3; continuing without multicall (response: $set_result)"
        return 0
    fi
}

save_anvil_state() {
    log_info "Saving contract addresses to cache..."
    mkdir -p "$CACHE_DIR"

    # Anvil state is snapshotted by Anvil itself to:
    #   $ANVIL_STATE_FILE
    # via `--dump-state/--state` + `--state-interval`.

    # Save addresses
    cat > "$ADDRESSES_CACHE" << EOF
export TANGLE_PROXY="$TANGLE_PROXY"
export RESTAKING_PROXY="$RESTAKING_PROXY"
export STATUS_REGISTRY="$STATUS_REGISTRY"
export USDC_ADDRESS="$USDC_ADDRESS"
export USDT_ADDRESS="$USDT_ADDRESS"
export DAI_ADDRESS="$DAI_ADDRESS"
export WETH_ADDRESS="$WETH_ADDRESS"
export STETH_ADDRESS="$STETH_ADDRESS"
export WSTETH_ADDRESS="$WSTETH_ADDRESS"
export EIGEN_ADDRESS="$EIGEN_ADDRESS"
export REWARD_VAULTS_ADDRESS="${REWARD_VAULTS_ADDRESS:-}"
export INFLATION_POOL_ADDRESS="${INFLATION_POOL_ADDRESS:-}"
export TNT_TOKEN_ADDRESS="${TNT_TOKEN_ADDRESS:-}"
export CREDITS_ADDRESS="${CREDITS_ADDRESS:-}"
export TANGLE_MIGRATION_ADDRESS="${TANGLE_MIGRATION_ADDRESS:-}"
export MIGRATION_TNT_TOKEN_ADDRESS="${MIGRATION_TNT_TOKEN_ADDRESS:-}"
EOF

    log_success "Anvil state cached"
}

clear_cache() {
    log_info "Clearing local-env cache..."
    rm -rf "$CACHE_DIR"
    log_success "Cache cleared - next startup will do fresh deployment"
}

deploy_contracts() {
    log_info "Deploying contracts..."
    cd "$TNT_CORE_DIR"

    local deployer_nonce=""
    local contract_code=""
    local forge_status=0
    local attempt

    for attempt in 1 2; do
        # Clear forge broadcast cache to ensure deterministic addresses on fresh Anvil
        # (keeps compiled artifacts cached for faster subsequent runs)
        log_info "Clearing forge broadcast cache..."
        rm -rf broadcast/LocalTestnet.s.sol/ 2>/dev/null || true

        log_info "Running LocalTestnet setup (attempt $attempt/2)..."
        set +e
        forge script script/v2/LocalTestnet.s.sol:LocalTestnetSetup \
            --rpc-url "http://127.0.0.1:$ANVIL_PORT" \
            --private-key "$ANVIL_PRIVATE_KEY" \
            --broadcast \
            --non-interactive \
            --slow 2>&1 | tee /tmp/deploy.log
        forge_status=${PIPESTATUS[0]}
        set -e

        if [[ "$forge_status" -ne 0 ]]; then
            log_warn "forge script exited non-zero (status=$forge_status)."
        fi

        # Give anvil time to process transactions
        sleep 2

        # Check if deployment actually happened by verifying deployer nonce
        deployer_nonce=$(curl -s "http://127.0.0.1:$ANVIL_PORT" -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_getTransactionCount","params":["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "latest"],"id":1}' \
            | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

        # Verify contract code exists at the canonical deterministic address.
        contract_code=$(curl -s "http://127.0.0.1:$ANVIL_PORT" -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "latest"],"id":1}' \
            | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

        if [[ "$deployer_nonce" != "0x0" && -n "$contract_code" && "$contract_code" != "0x" ]]; then
            log_info "Deployer nonce: $deployer_nonce"
            log_info "Tangle contract code length: ${#contract_code} chars"
            break
        fi

        if [[ "$attempt" -eq 2 ]]; then
            if [[ "$deployer_nonce" == "0x0" ]]; then
                log_error "Deployment failed - no transactions sent. Check /tmp/deploy.log"
            else
                log_error "Tangle contract has no code at the expected address. Check /tmp/deploy.log"
            fi
            return 1
        fi

        log_warn "Deployment did not complete cleanly; restarting Anvil and retrying once..."
        lsof -ti:"$ANVIL_PORT" | xargs kill 2>/dev/null || true
        sleep 1
        start_anvil fresh
        cd "$TNT_CORE_DIR"
    done

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
    export CREDITS_ADDRESS=$(grep "Credits:" /tmp/deploy.log | head -1 | grep -oE '0x[a-fA-F0-9]{40}' || echo "")
    # Resolve TNT token from on-chain config (preferred) to avoid log parsing issues.
    # Tangle.operatorBondToken() is the canonical source of truth.
    local resolved_tnt=""
    if command -v cast >/dev/null 2>&1; then
        resolved_tnt="$(cast call --rpc-url "http://127.0.0.1:$ANVIL_PORT" "$TANGLE_PROXY" "operatorBondToken()(address)" 2>/dev/null | tail -n 1 || true)"
    fi
    if [[ -n "$resolved_tnt" && "$resolved_tnt" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
        export TNT_TOKEN_ADDRESS="$resolved_tnt"
    else
        export TNT_TOKEN_ADDRESS=$(grep -E "TangleToken \\(bond asset\\):" /tmp/deploy.log | tail -1 | grep -oE '0x[a-fA-F0-9]{40}' || echo "")
        if [[ -z "$TNT_TOKEN_ADDRESS" ]]; then
            TNT_TOKEN_ADDRESS=$(grep -E "Using existing TangleToken \\(bond asset\\):" /tmp/deploy.log | tail -1 | grep -oE '0x[a-fA-F0-9]{40}' || echo "")
        fi
    fi

    # Sanity-check that TNT_TOKEN_ADDRESS actually has code.
    if [[ -n "${TNT_TOKEN_ADDRESS:-}" ]]; then
        local tnt_code=$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$TNT_TOKEN_ADDRESS\", \"latest\"],\"id\":1}" \
            | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
        if [[ -z "$tnt_code" || "$tnt_code" == "0x" ]]; then
            log_warn "Detected TNT token address has no code: $TNT_TOKEN_ADDRESS (will not fund TNT)"
            export TNT_TOKEN_ADDRESS=""
        fi
    fi

    if [[ -n "$USDC_ADDRESS" ]]; then
        log_success "Token addresses parsed from deployment"
    else
        log_warn "Could not parse token addresses from deployment log"
    fi

    if [[ -n "$TNT_TOKEN_ADDRESS" ]]; then
        export TNT_TOKEN="$TNT_TOKEN_ADDRESS"
        log_success "Detected TNT token: $TNT_TOKEN_ADDRESS"
    else
        log_warn "Could not detect TNT token address from deployment log"
    fi

    if [[ -n "${CREDITS_ADDRESS:-}" ]]; then
        local credits_code
        credits_code="$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$CREDITS_ADDRESS\", \"latest\"],\"id\":1}" \
            | grep -o '"result":"[^"]*"' | cut -d'"' -f4)"
        if [[ -z "$credits_code" || "$credits_code" == "0x" ]]; then
            log_warn "Detected Credits address has no code: $CREDITS_ADDRESS"
            export CREDITS_ADDRESS=""
        else
            log_success "Detected Credits contract: $CREDITS_ADDRESS"
        fi
    fi

    log_success "Contracts deployed"
}

ensure_incentives_contracts() {
    # RewardVaults/InflationPool are optional modules. Prefer on-chain discovery and only deploy if missing.
    if ! command -v cast >/dev/null 2>&1; then
        log_warn "Foundry 'cast' not found; skipping incentives check."
        return 0
    fi

    if [[ -z "${RESTAKING_PROXY:-}" || -z "${TANGLE_PROXY:-}" || -z "${STATUS_REGISTRY:-}" ]]; then
        log_warn "Core contract addresses not set; skipping incentives check."
        return 0
    fi

    local rewards_manager
    rewards_manager="$(cast call --rpc-url "http://127.0.0.1:$ANVIL_PORT" "$RESTAKING_PROXY" "rewardsManager()(address)" 2>/dev/null | tail -n 1 || true)"

    if [[ -n "$rewards_manager" && "$rewards_manager" =~ ^0x[a-fA-F0-9]{40}$ && "$rewards_manager" != "0x0000000000000000000000000000000000000000" ]]; then
        local rm_code
        rm_code="$(curl -s "http://127.0.0.1:$ANVIL_PORT" -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$rewards_manager\", \"latest\"],\"id\":1}" \
            | grep -o '"result":"[^"]*"' | cut -d'"' -f4)"
        if [[ -n "$rm_code" && "$rm_code" != "0x" ]]; then
            export REWARD_VAULTS_ADDRESS="$rewards_manager"
            log_success "Incentives already deployed (RewardVaults proxy: $rewards_manager)"
            return 0
        fi
    fi

    log_info "Incentives not deployed; running FullDeploy to deploy RewardVaults/InflationPool..."

    local tnt_token="${TNT_TOKEN_ADDRESS:-}"
    if [[ -z "$tnt_token" ]]; then
        tnt_token="$(cast call --rpc-url "http://127.0.0.1:$ANVIL_PORT" "$TANGLE_PROXY" "operatorBondToken()(address)" 2>/dev/null | tail -n 1 || true)"
    fi

    if [[ -z "$tnt_token" || ! "$tnt_token" =~ ^0x[a-fA-F0-9]{40}$ || "$tnt_token" == "0x0000000000000000000000000000000000000000" ]]; then
        log_warn "Could not resolve TNT token address; skipping incentives deploy."
        return 0
    fi

    local cfg_path="$TNT_CORE_DIR/.local/full-deploy-config.json"
    mkdir -p "$(dirname "$cfg_path")"
    cat > "$cfg_path" << EOF
{
  "network": "local-anvil",
  "core": {
    "deploy": false,
    "tangle": "$TANGLE_PROXY",
    "restaking": "$RESTAKING_PROXY",
    "statusRegistry": "$STATUS_REGISTRY",
    "operatorBondToken": "$tnt_token"
  },
  "restakeAssets": [],
  "incentives": {
    "deployMetrics": true,
    "deployRewardVaults": true,
    "deployInflationPool": true,
    "tntToken": "$tnt_token"
  },
  "manifest": { "path": "", "logSummary": false },
  "migration": { "emitArtifacts": false, "artifactsPath": "", "merklePath": "", "notes": "" }
}
EOF

    (cd "$TNT_CORE_DIR" && \
      FULL_DEPLOY_CONFIG="$cfg_path" PRIVATE_KEY="$ANVIL_PRIVATE_KEY" \
      forge script script/v2/FullDeploy.s.sol:FullDeploy \
        --rpc-url "http://127.0.0.1:$ANVIL_PORT" \
        --broadcast \
        --non-interactive \
        --slow 2>&1 | tee /tmp/full-deploy.log || true)

    rewards_manager="$(cast call --rpc-url "http://127.0.0.1:$ANVIL_PORT" "$RESTAKING_PROXY" "rewardsManager()(address)" 2>/dev/null | tail -n 1 || true)"
    if [[ -n "$rewards_manager" && "$rewards_manager" =~ ^0x[a-fA-F0-9]{40}$ && "$rewards_manager" != "0x0000000000000000000000000000000000000000" ]]; then
        local rm_code
        rm_code="$(curl -s "http://127.0.0.1:$ANVIL_PORT" -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$rewards_manager\", \"latest\"],\"id\":1}" \
            | grep -o '"result":"[^"]*"' | cut -d'"' -f4)"
        if [[ -n "$rm_code" && "$rm_code" != "0x" ]]; then
            export REWARD_VAULTS_ADDRESS="$rewards_manager"
            log_success "Incentives deployed (RewardVaults proxy: $rewards_manager)"
        else
            log_warn "FullDeploy ran but RewardVaults proxy still has no code (check /tmp/full-deploy.log)."
        fi
    else
        log_warn "FullDeploy ran but rewardsManager could not be resolved."
    fi

    # Best-effort: capture InflationPool proxy from Foundry broadcast artifacts.
    if command -v jq >/dev/null 2>&1; then
        local broadcast_file
        broadcast_file="$(ls -t "$TNT_CORE_DIR/broadcast/FullDeploy.s.sol/"*/run-latest.json 2>/dev/null | head -1 || true)"
        if [[ -n "$broadcast_file" && -f "$broadcast_file" ]]; then
            local inflation_proxy
            inflation_proxy="$(jq -r '
              .transactions
              | to_entries
              | map(select(.value.contractName != null) | {name: .value.contractName, addr: (.value.contractAddress // "")})
              | . as $txs
              | (reduce range(0; ($txs|length)) as $i (""; if $txs[$i].name == "InflationPool" then ($txs[$i+1].addr // "") else . end))
            ' "$broadcast_file" 2>/dev/null | tail -n 1 || true)"
            if [[ -n "$inflation_proxy" && "$inflation_proxy" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
                export INFLATION_POOL_ADDRESS="$inflation_proxy"
            fi
        fi
    fi
}

deploy_migration_contracts() {
    log_info "Deploying TangleMigration contracts..."

    # Clear any stale values first; only set them once we confirm deployed code exists.
    export TANGLE_MIGRATION_ADDRESS=""
    export MIGRATION_TNT_TOKEN_ADDRESS=""

    # Check if migration data exists in tnt-core
    local migration_dir="$TNT_CORE_DIR/packages/migration-claim"
    if [[ ! -f "$migration_dir/merkle-tree.json" || ! -f "$migration_dir/evm-claims.json" ]]; then
        log_warn "Migration merkle-tree.json or evm-claims.json not found - skipping TangleMigration deployment"
        log_info "Ensure tnt-core/packages/migration-claim contains the merkle tree + EVM claims."
        return 0
    fi

    local contract_dir="$migration_dir"
    if [[ ! -d "$contract_dir" ]]; then
        log_warn "Migration contract directory not found: $contract_dir"
        return 0
    fi

    # Read migration data for exact totals using Node.js
    log_info "Reading migration data from $migration_dir..."
    local dist_data=$(node -e "
const fs = require('fs');
const merkle = JSON.parse(fs.readFileSync('$migration_dir/merkle-tree.json','utf8'));
const evm = JSON.parse(fs.readFileSync('$migration_dir/evm-claims.json','utf8'));
console.log(JSON.stringify({
  merkleRoot: merkle.root,
  totalSubstrate: merkle.totalValue,
  totalEvm: evm.totalAmount,
  substrateAccounts: merkle.entryCount,
  evmAccounts: evm.totalAccounts
}));
" 2>/dev/null) || { log_warn \"Failed to read migration data\"; return 0; }

    local merkle_root=$(echo "$dist_data" | jq -r '.merkleRoot')
    local total_substrate=$(echo "$dist_data" | jq -r '.totalSubstrate')
    local total_evm=$(echo "$dist_data" | jq -r '.totalEvm')
    local substrate_accounts=$(echo "$dist_data" | jq -r '.substrateAccounts')
    local evm_accounts=$(echo "$dist_data" | jq -r '.evmAccounts')

    log_info "Merkle Root: $merkle_root"
    log_info "Substrate: $(node -pe "BigInt('$total_substrate') / BigInt(1e18)") TNT ($substrate_accounts accounts)"
    log_info "EVM: $(node -pe "BigInt('$total_evm') / BigInt(1e18)") TNT ($evm_accounts accounts)"

    # Sanity check: ensure the merkle-tree.json proofs match the merkleRoot used for deployment.
    local proofs_root=""
    proofs_root="$(node -e "
      const fs = require('fs');
      const { encodeAbiParameters, keccak256, concatHex } = require('viem');
      const tree = JSON.parse(fs.readFileSync('$migration_dir/merkle-tree.json','utf8'));
      const firstKey = Object.keys(tree.entries || {})[0];
      if (!firstKey) { process.stdout.write(''); process.exit(0); }
      const entry = tree.entries[firstKey];
      const pubkey = entry.leaf[0];
      const amount = BigInt(entry.leaf[1]);
      const encoded = encodeAbiParameters([{type:'bytes32'},{type:'uint256'}],[pubkey, amount]);
      let computed = keccak256(concatHex([keccak256(encoded)]));
      for (const p of entry.proof) {
        const a = BigInt(computed);
        const b = BigInt(p);
        computed = keccak256(a < b ? concatHex([computed, p]) : concatHex([p, computed]));
      }
      process.stdout.write(computed);
    " 2>/dev/null || true)"

    if [[ -n "$proofs_root" && "$proofs_root" != "null" && "$proofs_root" != "$merkle_root" ]]; then
        log_error "migration-claim merkle-tree.json root mismatch."
        log_error "  merkle-tree.json root:         $merkle_root"
        log_error "  computed root from proof:      $proofs_root"
        return 0
    fi

    cd "$contract_dir"

    # Install dependencies if needed
    if [[ ! -d "lib/forge-std" ]]; then
        log_info "Installing Foundry dependencies..."
        forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-git 2>/dev/null || true
    fi

    # Build and deploy
    forge build --quiet 2>/dev/null || true

    # Clear any stale broadcast artifacts so we don't pick up old addresses when a deploy fails.
    rm -rf broadcast/DeployTangleMigration.s.sol/ 2>/dev/null || true

    run_migration_deploy() {
        MERKLE_ROOT="$merkle_root" \
        TOTAL_SUBSTRATE="$total_substrate" \
        TOTAL_EVM="$total_evm" \
        USE_MOCK_VERIFIER="true" \
        ALLOW_STANDALONE_TOKEN="$1" \
        TNT_TOKEN="$2" \
        TNT_TOKEN_ADDRESS="$2" \
        PRIVATE_KEY="$ANVIL_PRIVATE_KEY" \
        forge script script/DeployTangleMigration.s.sol:DeployTangleMigration \
            --rpc-url "http://127.0.0.1:$ANVIL_PORT" \
            --broadcast \
            --quiet \
            2>&1 | tee /tmp/migration-deploy.log || true
    }

    # Deploy with exact totals from distribution
    local allow_standalone="${ALLOW_STANDALONE_TOKEN:-false}"
    local configured_tnt="${TNT_TOKEN_ADDRESS:-}"
    run_migration_deploy "$allow_standalone" "$configured_tnt"

    if grep -q "Existing TNT balance insufficient" /tmp/migration-deploy.log 2>/dev/null; then
        log_warn "Existing TNT balance insufficient; redeploying migration with a standalone test token..."
        rm -rf broadcast/DeployTangleMigration.s.sol/ 2>/dev/null || true
        run_migration_deploy "true" ""
    fi

    # Extract addresses from broadcast
    local broadcast_file=$(ls -t broadcast/DeployTangleMigration.s.sol/*/run-latest.json 2>/dev/null | head -1)

    if [[ -f "$broadcast_file" ]]; then
        export MIGRATION_TNT_TOKEN_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "TNT") | .contractAddress' "$broadcast_file" 2>/dev/null | head -1)
        export TANGLE_MIGRATION_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "TangleMigration") | .contractAddress' "$broadcast_file" 2>/dev/null | head -1)

        # Fallback to grep if jq fails
        if [[ -z "${MIGRATION_TNT_TOKEN_ADDRESS:-}" || "${MIGRATION_TNT_TOKEN_ADDRESS}" == "null" ]]; then
            MIGRATION_TNT_TOKEN_ADDRESS=$(grep -o '"contractName": "TNT"' -A5 "$broadcast_file" 2>/dev/null | grep '"contractAddress"' | head -1 | grep -o '0x[a-fA-F0-9]\{40\}' || echo "")
        fi
        if [[ -z "${TANGLE_MIGRATION_ADDRESS:-}" || "${TANGLE_MIGRATION_ADDRESS}" == "null" ]]; then
            TANGLE_MIGRATION_ADDRESS=$(grep -o '"contractName": "TangleMigration"' -A5 "$broadcast_file" 2>/dev/null | grep '"contractAddress"' | head -1 | grep -o '0x[a-fA-F0-9]\{40\}' || echo "")
        fi
    fi

    if [[ -z "${MIGRATION_TNT_TOKEN_ADDRESS:-}" || "${MIGRATION_TNT_TOKEN_ADDRESS}" == "null" ]]; then
        export MIGRATION_TNT_TOKEN_ADDRESS="${TNT_TOKEN_ADDRESS:-}"
    fi

    # Verify deployed code exists (avoid caching stale addresses when deploy failed).
    local migration_code=""
    if [[ -n "${TANGLE_MIGRATION_ADDRESS:-}" && "${TANGLE_MIGRATION_ADDRESS}" != "null" ]]; then
        migration_code="$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$TANGLE_MIGRATION_ADDRESS\", \"latest\"],\"id\":1}" \
            | grep -o '"result":"[^"]*"' | cut -d'"' -f4)"
    fi
    if [[ -z "$migration_code" || "$migration_code" == "0x" ]]; then
        log_warn "TangleMigration deployment failed (no code at ${TANGLE_MIGRATION_ADDRESS:-<empty>}); check /tmp/migration-deploy.log"
        export TANGLE_MIGRATION_ADDRESS=""
        export MIGRATION_TNT_TOKEN_ADDRESS=""
        cd "$DAPP_ROOT"
        unset -f run_migration_deploy 2>/dev/null || true
        return 0
    fi

    if [[ -n "${MIGRATION_TNT_TOKEN_ADDRESS:-}" && "${MIGRATION_TNT_TOKEN_ADDRESS}" != "null" ]]; then
        local mig_token_code
        mig_token_code="$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$MIGRATION_TNT_TOKEN_ADDRESS\", \"latest\"],\"id\":1}" \
            | grep -o '"result":"[^"]*"' | cut -d'"' -f4)"
        if [[ -z "$mig_token_code" || "$mig_token_code" == "0x" ]]; then
            log_warn "Migration TNT token address has no code: $MIGRATION_TNT_TOKEN_ADDRESS"
            export MIGRATION_TNT_TOKEN_ADDRESS=""
        fi
    fi

    # Copy merkle data to frontend
    local proofs_dest="$DAPP_ROOT/apps/tangle-dapp/public/data"
    mkdir -p "$proofs_dest"
    cp "$migration_dir/merkle-tree.json" "$proofs_dest/migration-proofs.json"
    local credits_tree="$TNT_CORE_DIR/packages/credits/credits-tree.json"
    if [[ -f "$credits_tree" ]]; then
        cp "$credits_tree" "$proofs_dest/credits-tree.json"
    fi

    if [[ -n "${TANGLE_MIGRATION_ADDRESS:-}" && "${TANGLE_MIGRATION_ADDRESS}" != "null" ]]; then
        log_success "TangleMigration deployed: $TANGLE_MIGRATION_ADDRESS"
        log_info "Migration TNT token: ${MIGRATION_TNT_TOKEN_ADDRESS:-Not found}"
        log_info "Substrate allocation: $(node -pe "BigInt('$total_substrate') / BigInt(1e18)") TNT transferred to contract"
        log_info "EVM allocation: $(node -pe "BigInt('$total_evm') / BigInt(1e18)") TNT in deployer"
        log_info "Merkle data copied to: $proofs_dest/migration-proofs.json"
        if [[ -f "$credits_tree" ]]; then
            log_info "Credits data copied to: $proofs_dest/credits-tree.json"
        fi
    else
        log_warn "TangleMigration deployment may have failed - check /tmp/migration-deploy.log"
    fi

    cd "$DAPP_ROOT"
    unset -f run_migration_deploy 2>/dev/null || true
}

execute_evm_airdrop() {
    log_info "Executing EVM airdrop..."

    if [[ -z "${MIGRATION_TNT_TOKEN_ADDRESS:-}" || "${MIGRATION_TNT_TOKEN_ADDRESS}" == "null" ]]; then
        log_error "Migration TNT token not deployed. Run 'migration deploy' first."
        return 1
    fi

    # Find migration data
    local migration_dir="$TNT_CORE_DIR/packages/migration-claim"
    if [[ ! -f "$migration_dir/evm-claims.json" ]]; then
        log_error "evm-claims.json not found in tnt-core/packages/migration-claim"
        return 1
    fi

    local ANVIL_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    local RPC_URL="http://127.0.0.1:$ANVIL_PORT"

    # Execute airdrop in batches using Node.js + cast
    node -e "
const evm = require('$migration_dir/evm-claims.json');
const { execSync } = require('child_process');

	const TNT_ADDRESS = '$MIGRATION_TNT_TOKEN_ADDRESS';
	const RPC_URL = '$RPC_URL';
	const PRIVATE_KEY = '$ANVIL_PRIVATE_KEY';
	const BATCH_SIZE = 100;

const entries = evm.claims || [];
console.log('Total EVM recipients:', entries.length);

	let totalAirdropped = BigInt(0);

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
	            totalAirdropped += BigInt(amounts[j]);
	        }
	    } catch (e) {
	        console.error('Batch', batchNum, 'failed:', e.message);
	        process.exit(1);
	    }
	}

console.log('EVM airdrop complete!');
console.log('Total airdropped:', (totalAirdropped / BigInt(1e18)).toString(), 'TNT to', entries.length, 'addresses');
" 2>&1 | while read line; do log_info "$line"; done

    log_success "EVM airdrop complete"
}

start_indexer() {
    log_info "Setting up Envio indexer..."
    cd "$INDEXER_DIR"

    # Use local config
    cp config.local.yaml config.yaml

    # Check if we can skip codegen (generated files exist and are recent)
    local needs_codegen=true
    if [[ -f "$INDEXER_DIR/generated/src/EventHandlers.res.js" ]]; then
        local config_mtime=$(stat -f %m config.yaml 2>/dev/null || stat -c %Y config.yaml 2>/dev/null)
        local gen_mtime=$(stat -f %m "$INDEXER_DIR/generated/src/EventHandlers.res.js" 2>/dev/null || stat -c %Y "$INDEXER_DIR/generated/src/EventHandlers.res.js" 2>/dev/null)
        if [[ "$gen_mtime" -gt "$config_mtime" ]]; then
            log_info "Skipping codegen (generated files are up to date)"
            needs_codegen=false
        fi
    fi

    if [[ "$needs_codegen" == "true" ]]; then
        log_info "Running Envio codegen..."
        pnpm codegen
    fi

    # Setup generated package symlink
    log_info "Setting up generated package symlink..."
    rm -rf node_modules/.pnpm/generated@* 2>/dev/null || true
    rm -rf node_modules/generated 2>/dev/null || true
    ln -sfn ../generated node_modules/generated

    # Clear persisted state
    rm -f "$INDEXER_DIR/generated/persisted_state.envio.json"

    # Check if Docker containers are already running
    cd "$INDEXER_DIR/generated"
    local docker_running=false
    if docker compose ps 2>/dev/null | grep -q "running"; then
        docker_running=true
        log_info "Docker containers already running, reusing..."
        sync_ports_from_docker_compose
    fi

    if [[ "$docker_running" == "false" ]]; then
        log_info "Starting indexer database..."
        ensure_free_postgres_port
        ensure_free_hasura_port
        docker compose up -d --remove-orphans
        sync_ports_from_docker_compose
        wait_for_postgres
    fi

    # Ensure indexer can authenticate to Postgres even when volumes persist from a prior run.
    POSTGRES_PASSWORD_RESET=false
    ensure_postgres_password

    # If we changed the password under a running stack, Hasura may still be configured with the old one.
    if [[ "$POSTGRES_PASSWORD_RESET" == "true" ]]; then
        log_info "Recreating Hasura container to pick up updated Postgres credentials..."
        docker compose up -d --force-recreate graphql-engine >/dev/null
    fi

    # Wait for Hasura to be ready before db-setup
    log_info "Waiting for Hasura to be ready..."
    for i in {1..30}; do
        if curl -s "http://localhost:$GRAPHQL_PORT/healthz" | grep -q "OK" 2>/dev/null; then
            log_success "Hasura is ready"
            break
        fi
        sleep 1
    done

    # Run DB migrations (needed even if reusing containers)
    log_info "Running DB migrations..."
    pnpm db-setup

    # Clear chain progress (for fresh indexing from block 0)
    log_info "Clearing chain progress..."
    PGPASSWORD="$ENVIO_PG_PASSWORD" psql -h localhost -p "$ENVIO_PG_PORT" -U "$ENVIO_PG_USER" -d "$ENVIO_PG_DATABASE" -c \
        "TRUNCATE TABLE public.persisted_state, public.chain_metadata, public.dynamic_contract_registry CASCADE;" 2>/dev/null || true

    # Re-create symlink
    cd "$INDEXER_DIR"
    rm -rf node_modules/generated 2>/dev/null || true
    ln -sfn ../generated node_modules/generated

    # Start the indexer
    log_info "Starting indexer..."
    ensure_free_indexer_port
    cd "$INDEXER_DIR/generated"
    env \
        "ENVIO_RPC_URL_${ANVIL_CHAIN_ID}=http://127.0.0.1:$ANVIL_PORT" \
        ENVIO_INDEXER_PORT="$ENVIO_INDEXER_PORT" \
        METRICS_PORT="$METRICS_PORT" \
        ENVIO_PG_PORT="$ENVIO_PG_PORT" \
        ENVIO_PG_USER="$ENVIO_PG_USER" \
        ENVIO_PG_PASSWORD="$ENVIO_PG_PASSWORD" \
        ENVIO_PG_DATABASE="$ENVIO_PG_DATABASE" \
        TUI_OFF=true \
        pnpm start &
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

start_claim_relayer() {
    if [[ -n "${CLAIM_RELAYER_PID:-}" ]] && kill -0 "$CLAIM_RELAYER_PID" 2>/dev/null; then
        log_warn "Claim relayer already running (PID: $CLAIM_RELAYER_PID)"
        return
    fi

    if [[ -z "${TANGLE_MIGRATION_ADDRESS:-}" || "${TANGLE_MIGRATION_ADDRESS}" == "null" ]]; then
        log_warn "Cannot start claim relayer: TangleMigration contract not deployed yet"
        return
    fi

    # Ensure the configured address actually has deployed code (avoid relayer booting with stale cache).
    local mig_code
    mig_code="$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
        --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$TANGLE_MIGRATION_ADDRESS\", \"latest\"],\"id\":1}" \
        | grep -o '"result":"[^"]*"' | cut -d'"' -f4)"
    if [[ -z "$mig_code" || "$mig_code" == "0x" ]]; then
        log_warn "Cannot start claim relayer: no contract code at $TANGLE_MIGRATION_ADDRESS"
        return
    fi

    local relayer_key="$CLAIM_RELAYER_PRIVATE_KEY"
    local relayer_address
    relayer_address=$(cast wallet address "$relayer_key" 2>/dev/null | tail -1 || true)

    if [[ -z "$relayer_address" ]]; then
        log_error "Failed to derive relayer address from CLAIM_RELAYER_PRIVATE_KEY"
        return 1
    fi

    local relayer_dir=""
    if [[ -d "$TNT_CORE_DIR/apps/claim-relayer" ]]; then
        relayer_dir="$TNT_CORE_DIR/apps/claim-relayer"
    else
        relayer_dir="$DAPP_ROOT/apps/claim-relayer"
    fi
    if [[ ! -d "$relayer_dir" ]]; then
        log_error "Claim relayer workspace not found at $relayer_dir"
        return 1
    fi

    if [[ ! -d "$relayer_dir/node_modules" && ! -f "$relayer_dir/.pnp.cjs" ]]; then
        log_info "Installing claim relayer dependencies in $relayer_dir..."
        (cd "$relayer_dir" && yarn install) || {
            log_error "Failed to install claim relayer dependencies. Check $relayer_dir"
            return 1
        }
    fi

    log_info "Funding claim relayer wallet $relayer_address..."
    cast send \
        --rpc-url http://127.0.0.1:$ANVIL_PORT \
        --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
        "$relayer_address" \
        --value 500ether >/tmp/claim-relayer-fund.log 2>&1 || true

    log_info "Starting claim relayer dev server on port $CLAIM_RELAYER_PORT..."
    pushd "$relayer_dir" >/dev/null
    RELAYER_PRIVATE_KEY="$relayer_key" \
    MIGRATION_CONTRACT="$TANGLE_MIGRATION_ADDRESS" \
    RPC_URL="http://127.0.0.1:$ANVIL_PORT" \
    CHAIN_ID="$ANVIL_CHAIN_ID" \
    PORT="$CLAIM_RELAYER_PORT" \
    yarn dev &> "$CLAIM_RELAYER_LOG" &
    CLAIM_RELAYER_PID=$!
    popd >/dev/null

    sleep 2
    if kill -0 "$CLAIM_RELAYER_PID" 2>/dev/null; then
        log_success "Claim relayer started (PID: $CLAIM_RELAYER_PID, wallet: $relayer_address)"
        log_info "Health check: http://localhost:$CLAIM_RELAYER_PORT/health"
    else
        log_error "Failed to start claim relayer. Check $CLAIM_RELAYER_LOG"
        CLAIM_RELAYER_PID=""
    fi
}

ensure_migration_contracts() {
    if [[ -z "${TANGLE_MIGRATION_ADDRESS:-}" || "${TANGLE_MIGRATION_ADDRESS}" == "null" ]]; then
        deploy_migration_contracts
        return 0
    fi

    local mig_code
    mig_code="$(curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
        --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$TANGLE_MIGRATION_ADDRESS\", \"latest\"],\"id\":1}" \
        | grep -o '"result":"[^"]*"' | cut -d'"' -f4)"
    if [[ -z "$mig_code" || "$mig_code" == "0x" ]]; then
        log_warn "Cached migration contract has no code; redeploying..."
        export TANGLE_MIGRATION_ADDRESS=""
        export MIGRATION_TNT_TOKEN_ADDRESS=""
        deploy_migration_contracts
    fi

    return 0
}

stop_claim_relayer() {
    if [[ -n "${CLAIM_RELAYER_PID:-}" ]]; then
        log_info "Stopping claim relayer (PID: $CLAIM_RELAYER_PID)..."
        kill "$CLAIM_RELAYER_PID" 2>/dev/null || true
        wait "$CLAIM_RELAYER_PID" 2>/dev/null || true
        CLAIM_RELAYER_PID=""
        log_success "Claim relayer stopped"
    else
        log_warn "Claim relayer not running"
    fi
}

restart_claim_relayer() {
    stop_claim_relayer
    sleep 1
    start_claim_relayer
}

ensure_tnt_restake_asset() {
    if [[ -z "${TNT_TOKEN_ADDRESS:-}" || "${TNT_TOKEN_ADDRESS}" == "null" ]]; then
        log_warn "Skipping TNT restake registration - TNT token address not found"
        return
    fi

    if [[ -z "${RESTAKING_PROXY:-}" ]]; then
        log_warn "Skipping TNT restake registration - restaking proxy not set"
        return
    fi

    log_info "Ensuring TNT token is enabled as a restaked asset..."

    local result
    set +e
    result=$(
        RPC_URL="http://127.0.0.1:$ANVIL_PORT" \
        RESTAKING_ADDRESS="$RESTAKING_PROXY" \
        TNT_ADDRESS="$TNT_TOKEN_ADDRESS" \
        PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" \
        CHAIN_ID="$ANVIL_CHAIN_ID" \
        node --input-type=module <<'NODE'
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';

const rpcUrl = process.env.RPC_URL;
const restaking = process.env.RESTAKING_ADDRESS;
const tnt = process.env.TNT_ADDRESS;
const chainId = Number(process.env.CHAIN_ID ?? '31337');
const account = privateKeyToAccount(process.env.PRIVATE_KEY);

const chain = defineChain({
  id: chainId,
  name: 'Anvil',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  },
});

const abi = [
  {
    type: 'function',
    name: 'getAssetConfig',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [
      { name: 'enabled', type: 'bool' },
      { name: 'minOperatorStake', type: 'uint256' },
      { name: 'minDelegation', type: 'uint256' },
      { name: 'depositCap', type: 'uint256' },
      { name: 'currentDeposits', type: 'uint256' },
      { name: 'rewardMultiplierBps', type: 'uint16' },
    ],
  },
  {
    type: 'function',
    name: 'enableAsset',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'minOperatorStake', type: 'uint256' },
      { name: 'minDelegation', type: 'uint256' },
      { name: 'depositCap', type: 'uint256' },
      { name: 'rewardMultiplierBps', type: 'uint16' },
    ],
    outputs: [],
  },
];

const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });

const config = await publicClient.readContract({
  address: restaking,
  abi,
  functionName: 'getAssetConfig',
  args: [tnt],
});

if (config.enabled) {
  console.log('already-enabled');
  process.exit(0);
}

const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
const txHash = await walletClient.writeContract({
  address: restaking,
  abi,
  functionName: 'enableAsset',
  args: [tnt, 0n, 0n, 0n, 10_000],
});

await publicClient.waitForTransactionReceipt({ hash: txHash });
console.log('registered');
NODE
    )
    local status=$?
    set -e

    if [[ $status -ne 0 ]]; then
        log_warn "Failed to ensure TNT restake asset: $result"
        return
    fi

    if [[ "$result" == *"already-enabled"* ]]; then
        log_success "TNT already enabled as a restake asset"
    else
        log_success "TNT registered as a restake asset"
    fi
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

    # Ensure Docker containers (postgres, hasura) are running
    cd "$INDEXER_DIR/generated"
    if ! docker compose ps 2>/dev/null | grep -q "running"; then
        log_info "Docker containers not running, starting them..."
        ensure_free_postgres_port
        ensure_free_hasura_port
        docker compose up -d --remove-orphans
        sync_ports_from_docker_compose
        sleep 3
        # Wait for Hasura to be ready
        log_info "Waiting for Hasura to be ready..."
        for i in {1..30}; do
            if curl -s "http://localhost:$GRAPHQL_PORT/healthz" | grep -q "OK" 2>/dev/null; then
                log_success "Hasura is ready"
                break
            fi
            sleep 1
        done
        # Run migrations
        pnpm db-setup 2>/dev/null || true
    else
        sync_ports_from_docker_compose
    fi

    # Restart the indexer process
    log_info "Restarting indexer..."
    ensure_free_indexer_port
    env \
        "ENVIO_RPC_URL_${ANVIL_CHAIN_ID}=http://127.0.0.1:$ANVIL_PORT" \
        ENVIO_INDEXER_PORT="$ENVIO_INDEXER_PORT" \
        METRICS_PORT="$METRICS_PORT" \
        ENVIO_PG_PORT="$ENVIO_PG_PORT" \
        ENVIO_PG_USER="$ENVIO_PG_USER" \
        ENVIO_PG_PASSWORD="$ENVIO_PG_PASSWORD" \
        ENVIO_PG_DATABASE="$ENVIO_PG_DATABASE" \
        TUI_OFF=true \
        pnpm start &
    INDEXER_PID=$!
    cd "$SCRIPT_DIR"
    log_success "Indexer restarted (PID: $INDEXER_PID)"
}

docker_down() {
    log_info "Running docker compose down..."
    cd "$INDEXER_DIR/generated"
    if [[ "$WIPE_DOCKER_VOLUMES" == "true" ]]; then
        docker compose down -v --remove-orphans 2>/dev/null \
            && log_success "Docker compose down (with volumes) complete" \
            || log_error "Docker compose down failed"
    else
        docker compose down --remove-orphans 2>/dev/null \
            && log_success "Docker compose down complete" \
            || log_error "Docker compose down failed"
    fi
    cd "$SCRIPT_DIR"
}

docker_up() {
    log_info "Running docker compose up..."
    cd "$INDEXER_DIR/generated"
    ensure_free_postgres_port
    ensure_free_hasura_port
    docker compose up -d --remove-orphans 2>/dev/null \
        && log_success "Docker compose up complete" \
        || log_error "Docker compose up failed"
    sleep 3
    sync_ports_from_docker_compose
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

    if [[ -n "${CLAIM_RELAYER_PID:-}" ]] && kill -0 "$CLAIM_RELAYER_PID" 2>/dev/null; then
        echo -e "  Claim Relayer:     ${GREEN}Running${NC} (PID: $CLAIM_RELAYER_PID, port $CLAIM_RELAYER_PORT)"
    else
        echo -e "  Claim Relayer:     ${RED}Stopped${NC}"
    fi

    # Check Docker containers
    local docker_status=$(cd "$INDEXER_DIR/generated" && docker compose ps --format "{{.Status}}" 2>/dev/null | head -1)
    if [[ -n "$docker_status" && "$docker_status" == *"Up"* ]]; then
        echo -e "  Docker:            ${GREEN}Running${NC}"
    else
        echo -e "  Docker:            ${RED}Stopped${NC}"
    fi

    # Check cache status (addresses only - Anvil state not cached)
    if [[ -f "$ADDRESSES_CACHE" ]]; then
        echo -e "  Addresses cached:  ${GREEN}Yes${NC} (use 'cache clear' to reset)"
    else
        echo -e "  Addresses cached:  ${YELLOW}No${NC}"
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
    echo "Migration Contracts:"
    echo "  - TangleMigration:      ${TANGLE_MIGRATION_ADDRESS:-Not deployed}"
    echo "  - TNT Token:            ${MIGRATION_TNT_TOKEN_ADDRESS:-Not deployed}"
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
    echo -e "${YELLOW}Each account has 10,000 ETH. Use 'fund <address>' to add TNT + ERC20 tokens.${NC}"
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

fund_account() {
    local target_address="${1:-}"
    local eth_amount="${2:-100}"

    if [[ -z "$target_address" ]]; then
        echo ""
        echo -e "${BOLD}=== Fund Account ===${NC}"
        echo ""
        echo "Usage: fund <address> [eth_amount]"
        echo ""
        echo "Examples:"
        echo "  fund 0xd04E36A1C370c6115e1C676838AcD0b430d740F3"
        echo "  fund 0xd04E36A1C370c6115e1C676838AcD0b430d740F3 500"
        echo ""
        echo "This will:"
        echo "  1. Set ETH balance using anvil_setBalance (default: 100 ETH)"
        echo "  2. Transfer ERC20 tokens from deployer account"
        echo ""
        return
    fi

    log_info "Funding account: $target_address"

    # Convert ETH amount to wei (hex). Use python to avoid bash integer overflow.
    local eth_wei
    eth_wei="$(
        python3 - "$eth_amount" <<'PY'
from decimal import Decimal, getcontext
import sys

getcontext().prec = 80
eth = Decimal(sys.argv[1])
wei = int(eth * (Decimal(10) ** 18))
print(hex(wei))
PY
    )"

    # Use anvil_setBalance to set ETH balance
    log_info "Setting ETH balance to $eth_amount ETH..."
    local set_response
    set_response="$(
        curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"anvil_setBalance\",\"params\":[\"$target_address\", \"$eth_wei\"],\"id\":1}"
    )"

    local set_error
    set_error="$(
        python3 - "$set_response" <<'PY'
import json, sys
try:
    payload = json.loads(sys.argv[1])
except Exception:
    print("invalid_json")
    raise SystemExit(0)

err = payload.get("error")
if not err:
    print("")
    raise SystemExit(0)

msg = err.get("message") if isinstance(err, dict) else str(err)
print(msg or "unknown_error")
PY
    )"

    if [[ -n "$set_error" ]]; then
        log_error "Failed to set ETH balance: $set_error"
    else
        log_success "ETH balance set to $eth_amount ETH"
    fi

    local balance_hex
    set +e
    balance_hex="$(
        curl -s http://127.0.0.1:$ANVIL_PORT -X POST -H "Content-Type: application/json" \
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$target_address\",\"latest\"],\"id\":1}" \
            2>/dev/null \
        | sed -n 's/.*"result":"\\([^"]*\\)".*/\\1/p'
    )"
    set -e

    if [[ -n "$balance_hex" ]]; then
        local balance_eth
        balance_eth="$(
            python3 - "$balance_hex" <<'PY'
import sys
from decimal import Decimal, getcontext

getcontext().prec = 80
wei = int(sys.argv[1], 16)
eth = Decimal(wei) / (Decimal(10) ** 18)
print(f"{eth:f}")
PY
        )"
        log_info "ETH balance on RPC: $balance_eth"
    fi

    # Transfer ERC20 tokens using the activity generator
    if [[ -f "$SCRIPT_DIR/activity-generator.mjs" ]]; then
        log_info "Transferring ERC20 tokens..."

        cd "$SCRIPT_DIR"
        RPC_URL=http://127.0.0.1:$ANVIL_PORT \
        TNT_TOKEN_ADDRESS="${TNT_TOKEN_ADDRESS:-}" \
        USDC_ADDRESS="${USDC_ADDRESS:-}" \
        USDT_ADDRESS="${USDT_ADDRESS:-}" \
        DAI_ADDRESS="${DAI_ADDRESS:-}" \
        WETH_ADDRESS="${WETH_ADDRESS:-}" \
        STETH_ADDRESS="${STETH_ADDRESS:-}" \
        WSTETH_ADDRESS="${WSTETH_ADDRESS:-}" \
        EIGEN_ADDRESS="${EIGEN_ADDRESS:-}" \
        FUND_ADDRESS="$target_address" \
        node --input-type=module -e "
import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { anvil } from 'viem/chains';

const RPC_URL = process.env.RPC_URL;
const FUND_ADDRESS = process.env.FUND_ADDRESS;
const DEPLOYER_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Note: TNT_TOKEN_ADDRESS is the core TNT bond/governance token on this chain.
const TOKENS = {
  tnt: { address: process.env.TNT_TOKEN_ADDRESS, decimals: 18, amount: '100000' },
  usdc: { address: process.env.USDC_ADDRESS, decimals: 6, amount: '100000' },
  usdt: { address: process.env.USDT_ADDRESS, decimals: 6, amount: '100000' },
  dai: { address: process.env.DAI_ADDRESS, decimals: 18, amount: '100000' },
  weth: { address: process.env.WETH_ADDRESS, decimals: 18, amount: '100' },
  stETH: { address: process.env.STETH_ADDRESS, decimals: 18, amount: '100' },
  wstETH: { address: process.env.WSTETH_ADDRESS, decimals: 18, amount: '100' },
  eigen: { address: process.env.EIGEN_ADDRESS, decimals: 18, amount: '10000' },
};

const ERC20_ABI = [
  { name: 'transfer', type: 'function', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
];

const publicClient = createPublicClient({ chain: { ...anvil, id: 31337 }, transport: http(RPC_URL) });
const account = privateKeyToAccount(DEPLOYER_KEY);
const walletClient = createWalletClient({ account, chain: { ...anvil, id: 31337 }, transport: http(RPC_URL) });

for (const [name, token] of Object.entries(TOKENS)) {
  if (!token.address) continue;
  try {
    const code = await publicClient.getBytecode({ address: token.address });
    if (!code || code === '0x') {
      console.log('Skipping ' + name.toUpperCase() + ': address has no code (' + token.address + ')');
      continue;
    }
    const amount = parseUnits(token.amount, token.decimals);
    const balance = await publicClient.readContract({ address: token.address, abi: ERC20_ABI, functionName: 'balanceOf', args: [account.address] });
    if (balance >= amount) {
      const hash = await walletClient.writeContract({ address: token.address, abi: ERC20_ABI, functionName: 'transfer', args: [FUND_ADDRESS, amount] });
      await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transferred ' + token.amount + ' ' + name.toUpperCase());
    } else {
      console.log('Insufficient ' + name.toUpperCase() + ' balance in deployer');
    }
  } catch (e) {
    console.log('Failed to transfer ' + name.toUpperCase() + ': ' + e.message);
  }
}
console.log('Done!');
" 2>&1 | while read line; do log_info "$line"; done

        cd "$SCRIPT_DIR"
    fi

    log_success "Account funded: $target_address"
    echo ""
    echo "Balances:"
    [[ -n "${balance_eth:-}" ]] && echo "  - ETH: $balance_eth" || echo "  - ETH: $eth_amount"
    [[ -n "${TNT_TOKEN_ADDRESS:-}" ]] && echo "  - TNT: 100,000"
    [[ -n "${USDC_ADDRESS:-}" ]] && echo "  - USDC: 100,000"
    [[ -n "${USDT_ADDRESS:-}" ]] && echo "  - USDT: 100,000"
    [[ -n "${DAI_ADDRESS:-}" ]] && echo "  - DAI: 100,000"
    [[ -n "${WETH_ADDRESS:-}" ]] && echo "  - WETH: 100"
    [[ -n "${STETH_ADDRESS:-}" ]] && echo "  - stETH: 100"
    [[ -n "${WSTETH_ADDRESS:-}" ]] && echo "  - wstETH: 100"
    [[ -n "${EIGEN_ADDRESS:-}" ]] && echo "  - EIGEN: 10,000"
    echo ""
}

show_logs() {
    local component="${1:-}"
    case "$component" in
        deploy|contracts)
            echo -e "${BOLD}=== Deployment Log (last 50 lines) ===${NC}"
            tail -50 /tmp/deploy.log 2>/dev/null || echo "No deployment log found"
            ;;
        migration)
            echo -e "${BOLD}=== Migration Deployment Log (last 50 lines) ===${NC}"
            tail -50 /tmp/migration-deploy.log 2>/dev/null || echo "No migration deployment log found"
            ;;
        relayer)
            echo -e "${BOLD}=== Claim Relayer Log (last 50 lines) ===${NC}"
            tail -50 "$CLAIM_RELAYER_LOG" 2>/dev/null || echo "No relayer log found"
            ;;
        *)
            echo "Usage: logs <deploy|contracts|migration|relayer>"
            ;;
    esac
}

clear_indexer_state() {
    log_info "Clearing indexer state..."
    rm -f "$INDEXER_DIR/generated/persisted_state.envio.json"

    ensure_postgres_password
    PGPASSWORD="$ENVIO_PG_PASSWORD" psql -h localhost -p "$ENVIO_PG_PORT" -U "$ENVIO_PG_USER" -d "$ENVIO_PG_DATABASE" -c \
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
    echo -e "${CYAN}Claim Relayer:${NC}"
    echo "  relayer restart     - Restart the gasless claim relayer"
    echo "  relayer stop        - Stop the relayer"
    echo "  relayer start       - Start the relayer"
    echo ""
    echo -e "${CYAN}Migration:${NC}"
    echo "  migration deploy    - Deploy/redeploy TangleMigration contracts"
    echo "  migration airdrop   - Execute EVM airdrop (distribute to EVM holders)"
    echo "  logs migration      - Show migration deployment logs"
	    echo ""
	    echo -e "${CYAN}Docker:${NC}"
	    echo "  docker down         - Run docker compose down (set WIPE_DOCKER_VOLUMES=true for -v)"
	    echo "  docker up           - Run docker compose up -d"
	    echo "  docker restart      - Restart docker containers"
	    echo ""
    echo -e "${CYAN}Cache:${NC}"
    echo "  cache clear         - Clear cached Anvil state (force fresh deploy)"
    echo "  cache save          - Save current Anvil state to cache"
    echo "  cache status        - Show cache status"
    echo "  reset               - Clear cache and exit (restart script for fresh deploy)"
    echo ""
    echo -e "${CYAN}Funding:${NC}"
    echo "  fund <address>      - Fund an address with ETH + ERC20 tokens"
    echo "  fund <address> <eth>- Fund with specific ETH amount"
    echo ""
    echo -e "${CYAN}Info:${NC}"
    echo "  status              - Show status of all components"
    echo "  addresses           - Show contract addresses"
    echo "  accounts            - Show development accounts with private keys"
    echo "  logs deploy         - Show deployment logs"
    echo ""
    echo -e "${CYAN}Other:${NC}"
    echo "  help                - Show this help"
    echo "  quit, exit, q       - Exit CLI (keeps Anvil/Docker running for resume)"
    echo "  stop all            - Fully stop everything (Anvil, Docker, indexer)"
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
    if [[ -n "${CREDITS_ADDRESS:-}" && "${CREDITS_ADDRESS}" != "null" ]]; then
        echo "  VITE_CREDITS_ADDRESS_31337=$CREDITS_ADDRESS"
    fi
    if [[ -n "${TANGLE_MIGRATION_ADDRESS:-}" && "${TANGLE_MIGRATION_ADDRESS}" != "null" ]]; then
        echo "  VITE_TANGLE_MIGRATION_ADDRESS=$TANGLE_MIGRATION_ADDRESS"
        echo "  VITE_CLAIM_RELAYER_URL=http://localhost:$CLAIM_RELAYER_PORT"
    fi
    echo ""
    echo -e "${BOLD}Development Accounts (10 accounts with 10,000 ETH + ERC20 tokens):${NC}"
    echo "  #0 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Deployer)"
    echo "  #1 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    echo "  #2 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    echo -e "  ${CYAN}...type 'accounts' for all 10 with private keys${NC}"
    echo ""
    if [[ -n "${TANGLE_MIGRATION_ADDRESS:-}" && "${TANGLE_MIGRATION_ADDRESS}" != "null" ]]; then
        echo -e "${GREEN}Migration claim available at: http://localhost:5173/claim/migration${NC}"
        echo ""
    fi
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

            # Migration commands
            migration)
                case "$args" in
                    deploy) deploy_migration_contracts ;;
                    airdrop) execute_evm_airdrop ;;
                    *) echo "Usage: migration <deploy|airdrop>" ;;
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

            # Claim relayer commands
            relayer)
                case "$args" in
                    restart) restart_claim_relayer ;;
                    stop) stop_claim_relayer ;;
                    start) start_claim_relayer ;;
                    *) echo "Usage: relayer <restart|stop|start>" ;;
                esac
                ;;

            # Cache commands
            cache)
                case "$args" in
                    clear)
                        clear_cache
                        ;;
                    save)
                        save_anvil_state
                        ;;
                    status)
                        echo -e "${BOLD}=== Cache Status ===${NC}"
                        if [[ -f "$ANVIL_STATE_FILE" ]]; then
                            echo -e "  Anvil state:   ${GREEN}Cached${NC} ($ANVIL_STATE_FILE)"
                        else
                            echo -e "  Anvil state:   ${YELLOW}Not cached${NC} (run once without 'resume')"
                        fi
                        if [[ -f "$ADDRESSES_CACHE" ]]; then
                            echo -e "  Addresses:     ${GREEN}Cached${NC}"
                        else
                            echo -e "  Addresses:     ${YELLOW}Not cached${NC}"
                        fi
                        echo ""
                        echo "Cache location: $CACHE_DIR"
                        ;;
                    *) echo "Usage: cache <clear|save|status>" ;;
                esac
                ;;

            # Funding commands
            fund)
                # Parse address and optional amount from args
                local fund_addr=$(echo "$args" | awk '{print $1}')
                local fund_amt=$(echo "$args" | awk '{print $2}')
                fund_account "$fund_addr" "$fund_amt"
                ;;

            # Info commands
            status) show_status ;;
            addresses) show_addresses ;;
            accounts) show_accounts ;;
            logs) show_logs "$args" ;;
            help|h|\?) print_help ;;

            # Reset command - clear cache and exit
            reset)
                clear_cache
                log_info "Exiting - restart script for fresh deployment..."
                break
                ;;

            # Stop all - fully shutdown everything
            "stop all"|stopall)
                log_info "Fully stopping all services..."
                # Kill indexer and activity generator
                [[ -n "${INDEXER_PID:-}" ]] && kill "$INDEXER_PID" 2>/dev/null || true
                [[ -n "${ACTIVITY_PID:-}" ]] && kill "$ACTIVITY_PID" 2>/dev/null || true
                [[ -n "${CLAIM_RELAYER_PID:-}" ]] && kill "$CLAIM_RELAYER_PID" 2>/dev/null || true
                pkill -f "ts-node src/Index" 2>/dev/null || true
                pkill -f "activity-generator" 2>/dev/null || true
                # Stop Docker
                cd "$INDEXER_DIR/generated" && docker compose down 2>/dev/null || true
                cd "$SCRIPT_DIR"
                # Kill Anvil
                lsof -ti:$ANVIL_PORT | xargs kill 2>/dev/null || true
                log_success "All services stopped"
                # Disable the cleanup trap since we already cleaned up
                trap - EXIT
                exit 0
                ;;

            # Exit commands (keeps Anvil/Docker running)
            quit|exit|q)
                log_info "Exiting CLI (Anvil and Docker kept running for resume)..."
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

resume_session() {
    log_info "Resuming existing session..."

    # Check prerequisites
    check_prerequisites

    # Load cached addresses if available
    if [[ -f "$ADDRESSES_CACHE" ]]; then
        source "$ADDRESSES_CACHE"
        log_success "Loaded cached contract addresses"
    else
        log_error "No cached addresses found. Run without 'resume' first to deploy contracts."
        exit 1
    fi

    # Ensure Anvil is available (start from snapshot if needed)
    if is_anvil_running; then
        log_success "Anvil is running on port $ANVIL_PORT"
    else
        log_warn "Anvil is not running; starting from last snapshot..."
        start_anvil resume
    fi

    # Check Docker containers
    cd "$INDEXER_DIR/generated"
    if docker compose ps 2>/dev/null | grep -q "running"; then
        log_success "Docker containers (postgres, hasura) are running"
        sync_ports_from_docker_compose
    else
        log_warn "Docker containers not running. Starting..."
        ensure_free_postgres_port
        ensure_free_hasura_port
        docker compose up -d --remove-orphans
        sleep 3
        # Wait for Hasura
        for i in {1..30}; do
            if curl -s "http://localhost:$GRAPHQL_PORT/healthz" | grep -q "OK" 2>/dev/null; then
                break
            fi
            sleep 1
        done
        pnpm db-setup 2>/dev/null || true
        sync_ports_from_docker_compose
        log_success "Docker containers started"
    fi
    cd "$SCRIPT_DIR"

    # Check if indexer is running
    if pgrep -f "ts-node src/Index" > /dev/null 2>&1; then
        INDEXER_PID=$(pgrep -f "ts-node src/Index" | head -1)
        log_success "Indexer is running (PID: $INDEXER_PID)"
    else
        log_warn "Indexer not running. Starting..."
        cd "$INDEXER_DIR/generated"
        ensure_free_indexer_port
        env \
            "ENVIO_RPC_URL_${ANVIL_CHAIN_ID}=http://127.0.0.1:$ANVIL_PORT" \
            ENVIO_INDEXER_PORT="$ENVIO_INDEXER_PORT" \
            METRICS_PORT="$METRICS_PORT" \
            ENVIO_PG_PORT="$ENVIO_PG_PORT" \
            ENVIO_PG_USER="$ENVIO_PG_USER" \
            ENVIO_PG_PASSWORD="$ENVIO_PG_PASSWORD" \
            ENVIO_PG_DATABASE="$ENVIO_PG_DATABASE" \
            TUI_OFF=true \
            pnpm start &
        INDEXER_PID=$!
        cd "$SCRIPT_DIR"
        sleep 3
        log_success "Indexer started (PID: $INDEXER_PID)"
    fi

    # Check activity generator (optional)
    if pgrep -f "activity-generator" > /dev/null 2>&1; then
        ACTIVITY_PID=$(pgrep -f "activity-generator" | head -1)
        log_success "Activity generator is running (PID: $ACTIVITY_PID)"
    else
        log_info "Activity generator not running. Use 'activity start' to start it."
    fi

    # Check claim relayer
    local relayer_port_pid
    relayer_port_pid=$(lsof -ti:$CLAIM_RELAYER_PORT 2>/dev/null | head -1 || true)
    if [[ -n "$relayer_port_pid" ]]; then
        CLAIM_RELAYER_PID="$relayer_port_pid"
        log_success "Claim relayer is running (PID: $CLAIM_RELAYER_PID, port $CLAIM_RELAYER_PORT)"
    else
        ensure_migration_contracts
        log_warn "Claim relayer not running. Starting..."
        start_claim_relayer
    fi

    ensure_incentives_contracts
    ensure_tnt_restake_asset

    log_success "Session resumed successfully!"
    echo ""
}

main() {
    # Handle resume mode
    if [[ "$RESUME_MODE" == "true" ]]; then
        resume_session
        interactive_cli
        return
    fi

    # Handle clean mode
    if [[ "$CLEAN_MODE" == "true" ]]; then
        # Users expect "clean" to be fully fresh; by default, tear down docker and wipe volumes unless explicitly overridden.
        if [[ "$USER_PROVIDED_CLEAN_DOCKER" == "false" ]]; then
            CLEAN_DOCKER=true
        fi
        if [[ "$USER_PROVIDED_WIPE_DOCKER_VOLUMES" == "false" ]]; then
            WIPE_DOCKER_VOLUMES=true
        fi

        log_info "Cleaning cached state..."
        rm -rf "$CACHE_DIR"
        if [[ "$CLEAN_DOCKER" == "true" ]]; then
            cd "$INDEXER_DIR/generated" 2>/dev/null && (
                if [[ "$WIPE_DOCKER_VOLUMES" == "true" ]]; then
                    docker compose down -v --remove-orphans 2>/dev/null || true
                else
                    docker compose down --remove-orphans 2>/dev/null || true
                fi
            )
        else
            log_warn "CLEAN_DOCKER=false: not running docker compose down during clean"
        fi
        cd "$SCRIPT_DIR"
        log_success "Cache cleaned"
    fi

    log_info "Starting local development environment..."

    check_prerequisites
    start_anvil
    deploy_contracts
    ensure_incentives_contracts
    deploy_migration_contracts
    ensure_tnt_restake_asset

    # Save contract addresses for resume mode
    save_anvil_state

    start_indexer
    start_activity_generator
    start_claim_relayer

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

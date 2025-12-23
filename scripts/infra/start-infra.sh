#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: ./scripts/infra/start-infra.sh [local|base-sepolia]

Starts infra + dApp for local Anvil or Base Sepolia.
Env configs:
  scripts/infra/infra.local.env
  scripts/infra/infra.base-sepolia.env
USAGE
}

NETWORK="${1:-local}"
case "$NETWORK" in
  local|localhost|31337)
    NETWORK="local"
    ;;
  base|base-mainnet|8453)
    NETWORK="base"
    ;;
  base-sepolia|84532)
    NETWORK="base-sepolia"
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    echo "Unknown network: $NETWORK"
    usage
    exit 1
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DAPP_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [[ -z "${TNT_CORE_DIR:-}" ]]; then
  if [[ -d "$DAPP_ROOT/../tnt-core" ]]; then
    TNT_CORE_DIR="$DAPP_ROOT/../tnt-core"
  elif [[ -d "$DAPP_ROOT/../../tnt-core" ]]; then
    TNT_CORE_DIR="$DAPP_ROOT/../../tnt-core"
  else
    echo "ERROR: Could not find tnt-core directory. Set TNT_CORE_DIR environment variable."
    exit 1
  fi
fi
TNT_CORE_DIR="$(cd "$TNT_CORE_DIR" && pwd)"

ENV_FILE="$SCRIPT_DIR/infra.${NETWORK}.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: Missing config file: $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

CHAIN_ID="${CHAIN_ID:-}"
RPC_URL="${RPC_URL:-}"
if [[ -z "$CHAIN_ID" || -z "$RPC_URL" ]]; then
  echo "ERROR: CHAIN_ID and RPC_URL are required in $ENV_FILE"
  exit 1
fi

HASURA_EXTERNAL_PORT="${HASURA_EXTERNAL_PORT:-8080}"
CLAIM_RELAYER_PORT="${CLAIM_RELAYER_PORT:-3001}"
PROVER_API_PORT="${PROVER_API_PORT:-8081}"
ENVIO_INDEXER_PORT="${ENVIO_INDEXER_PORT:-9898}"
ENVIO_PG_PORT="${ENVIO_PG_PORT:-5433}"
ENVIO_PG_USER="${ENVIO_PG_USER:-postgres}"
ENVIO_PG_PASSWORD="${ENVIO_PG_PASSWORD:-testing}"
ENVIO_PG_DATABASE="${ENVIO_PG_DATABASE:-envio-dev}"
LOCAL_ENV_ARGS="${LOCAL_ENV_ARGS:-}"

log_info() { echo "[INFO] $1"; }
log_warn() { echo "[WARN] $1"; }
log_error() { echo "[ERROR] $1"; }

require_env() {
  local key="$1"
  if [[ -z "${!key:-}" ]]; then
    log_error "Missing required env: $key"
    exit 1
  fi
}

wait_for_file() {
  local path="$1"
  local timeout="$2"
  local waited=0
  while [[ ! -f "$path" ]]; do
    if (( waited >= timeout )); then
      return 1
    fi
    sleep 1
    waited=$((waited + 1))
  done
  return 0
}

manifest_value() {
  local manifest="$1"
  local key="$2"
  node -e "const m=require(process.argv[1]); const key=process.argv[2]; const value=key.split('.').reduce((o,k)=> (o && o[k] !== undefined ? o[k] : undefined), m); if (value !== undefined && value !== null) console.log(value);" "$manifest" "$key" 2>/dev/null || true
}

PIDS=()
cleanup() {
  if [[ ${#PIDS[@]} -eq 0 ]]; then
    return
  fi
  log_info "Stopping infra..."
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
}
trap cleanup EXIT INT TERM

start_bg() {
  local name="$1"
  shift
  "$@" &
  local pid=$!
  PIDS+=("$pid")
  log_info "Started $name (PID: $pid)"
}

start_dapp() {
  local extra_env=(
    "VITE_ENVIO_MAINNET_ENDPOINT=http://localhost:${HASURA_EXTERNAL_PORT}/v1/graphql"
    "VITE_ENVIO_TESTNET_ENDPOINT=http://localhost:${HASURA_EXTERNAL_PORT}/v1/graphql"
  )

  if [[ -n "${VITE_TANGLE_MIGRATION_ADDRESS:-}" ]]; then
    extra_env+=("VITE_TANGLE_MIGRATION_ADDRESS=$VITE_TANGLE_MIGRATION_ADDRESS")
  fi
  if [[ -n "${VITE_MIGRATION_RPC_URL:-}" ]]; then
    extra_env+=("VITE_MIGRATION_RPC_URL=$VITE_MIGRATION_RPC_URL")
  fi
  if [[ -n "${VITE_MIGRATION_PROOFS_URL:-}" ]]; then
    extra_env+=("VITE_MIGRATION_PROOFS_URL=$VITE_MIGRATION_PROOFS_URL")
  fi
  if [[ -n "${VITE_CLAIM_RELAYER_URL:-}" ]]; then
    extra_env+=("VITE_CLAIM_RELAYER_URL=$VITE_CLAIM_RELAYER_URL")
  fi
  if [[ -n "${VITE_SP1_PROVER_API_URL:-}" ]]; then
    extra_env+=("VITE_SP1_PROVER_API_URL=$VITE_SP1_PROVER_API_URL")
  fi
  if [[ -n "${VITE_MOCK_PROOF:-}" ]]; then
    extra_env+=("VITE_MOCK_PROOF=$VITE_MOCK_PROOF")
  fi
  if [[ -n "${VITE_CREDITS_ADDRESS_31337:-}" ]]; then
    extra_env+=("VITE_CREDITS_ADDRESS_31337=$VITE_CREDITS_ADDRESS_31337")
  fi
  if [[ -n "${VITE_CREDITS_ADDRESS_84532:-}" ]]; then
    extra_env+=("VITE_CREDITS_ADDRESS_84532=$VITE_CREDITS_ADDRESS_84532")
  fi
  if [[ -n "${VITE_CREDITS_ADDRESS_8453:-}" ]]; then
    extra_env+=("VITE_CREDITS_ADDRESS_8453=$VITE_CREDITS_ADDRESS_8453")
  fi
  if [[ -n "${VITE_CREDITS_TREE_URL_31337:-}" ]]; then
    extra_env+=("VITE_CREDITS_TREE_URL_31337=$VITE_CREDITS_TREE_URL_31337")
  fi
  if [[ -n "${VITE_CREDITS_TREE_URL_84532:-}" ]]; then
    extra_env+=("VITE_CREDITS_TREE_URL_84532=$VITE_CREDITS_TREE_URL_84532")
  fi
  if [[ -n "${VITE_CREDITS_TREE_URL_8453:-}" ]]; then
    extra_env+=("VITE_CREDITS_TREE_URL_8453=$VITE_CREDITS_TREE_URL_8453")
  fi

  start_bg "dapp" env "${extra_env[@]}" yarn start:tangle-dapp
}

if [[ "$NETWORK" == "local" ]]; then
  log_info "Starting local environment (non-interactive)..."
  STRICT_HASURA_PORT=true \
  HASURA_EXTERNAL_PORT="$HASURA_EXTERNAL_PORT" \
  CLAIM_RELAYER_PORT="$CLAIM_RELAYER_PORT" \
  TNT_CORE_DIR="$TNT_CORE_DIR" \
  "$DAPP_ROOT/scripts/local-env/start-local-env.sh" $LOCAL_ENV_ARGS </dev/null &
  PIDS+=("$!")

  ADDR_CACHE="/tmp/local-env-cache/addresses.env"
  if ! wait_for_file "$ADDR_CACHE" 180; then
    log_error "Timed out waiting for $ADDR_CACHE"
    exit 1
  fi

  # shellcheck disable=SC1090
  source "$ADDR_CACHE"

  if [[ -n "${CREDITS_ADDRESS:-}" ]]; then
    VITE_CREDITS_ADDRESS_31337="$CREDITS_ADDRESS"
  fi
  if [[ -n "${TANGLE_MIGRATION_ADDRESS:-}" ]]; then
    VITE_TANGLE_MIGRATION_ADDRESS="$TANGLE_MIGRATION_ADDRESS"
  fi

  VITE_MIGRATION_RPC_URL="${VITE_MIGRATION_RPC_URL:-$RPC_URL}"
  VITE_MIGRATION_PROOFS_URL="${VITE_MIGRATION_PROOFS_URL:-/data/migration-proofs.json}"
  VITE_CLAIM_RELAYER_URL="${VITE_CLAIM_RELAYER_URL:-http://localhost:${CLAIM_RELAYER_PORT}}"
  VITE_SP1_PROVER_API_URL="${VITE_SP1_PROVER_API_URL:-}"

  start_dapp
  wait
  exit 0
fi

MANIFEST="${MANIFEST_PATH:-$TNT_CORE_DIR/deployments/$NETWORK/latest.json}"
if [[ ! -f "$MANIFEST" ]]; then
  log_error "Missing manifest: $MANIFEST"
  log_error "Set MANIFEST_PATH in scripts/infra/infra.${NETWORK}.env if needed."
  exit 1
fi

MIGRATION_CONTRACT="$(manifest_value "$MANIFEST" "migration.tangleMigration")"
CREDITS_ADDRESS="$(manifest_value "$MANIFEST" "credits")"
PROGRAM_VKEY="${SP1_PROGRAM_VKEY:-$(manifest_value "$MANIFEST" "migration.programVKey")}"
VERIFIER_GATEWAY="${SP1_VERIFIER_ADDRESS:-$(manifest_value "$MANIFEST" "migration.sp1VerifierGateway")}"
if [[ -z "$VERIFIER_GATEWAY" ]]; then
  VERIFIER_GATEWAY="0x397A5f7f3dBd538f23DE225B51f532c34448dA9B"
fi

if [[ -z "$MIGRATION_CONTRACT" ]]; then
  log_error "Missing migration.tangleMigration in manifest"
  exit 1
fi
if [[ -n "$CREDITS_ADDRESS" ]]; then
  if [[ "$CHAIN_ID" == "84532" ]]; then
    VITE_CREDITS_ADDRESS_84532="${VITE_CREDITS_ADDRESS_84532:-$CREDITS_ADDRESS}"
  elif [[ "$CHAIN_ID" == "8453" ]]; then
    VITE_CREDITS_ADDRESS_8453="${VITE_CREDITS_ADDRESS_8453:-$CREDITS_ADDRESS}"
  else
    VITE_CREDITS_ADDRESS="${VITE_CREDITS_ADDRESS:-$CREDITS_ADDRESS}"
  fi
fi
VITE_TANGLE_MIGRATION_ADDRESS="${VITE_TANGLE_MIGRATION_ADDRESS:-$MIGRATION_CONTRACT}"
VITE_MIGRATION_RPC_URL="${VITE_MIGRATION_RPC_URL:-$RPC_URL}"
VITE_MIGRATION_PROOFS_URL="${VITE_MIGRATION_PROOFS_URL:-/data/migration-proofs.json}"
VITE_CLAIM_RELAYER_URL="${VITE_CLAIM_RELAYER_URL:-http://localhost:${CLAIM_RELAYER_PORT}}"
VITE_SP1_PROVER_API_URL="${VITE_SP1_PROVER_API_URL:-http://localhost:${PROVER_API_PORT}}"
VITE_MOCK_PROOF="${VITE_MOCK_PROOF:-false}"

# Copy migration and credits data into dApp public data dir
DATA_DIR="$DAPP_ROOT/apps/tangle-dapp/public/data"
mkdir -p "$DATA_DIR"
if [[ -f "$TNT_CORE_DIR/packages/migration-claim/merkle-tree.json" ]]; then
  cp "$TNT_CORE_DIR/packages/migration-claim/merkle-tree.json" "$DATA_DIR/migration-proofs.json"
else
  log_warn "Missing merkle-tree.json in tnt-core packages/migration-claim"
fi
if [[ -f "$TNT_CORE_DIR/packages/credits/credits-tree.json" ]]; then
  cp "$TNT_CORE_DIR/packages/credits/credits-tree.json" "$DATA_DIR/credits-tree.json"
fi

require_env RELAYER_PRIVATE_KEY
require_env NETWORK_PRIVATE_KEY
if [[ -z "$PROGRAM_VKEY" ]]; then
  log_error "Missing SP1_PROGRAM_VKEY (set in env file or manifest)"
  exit 1
fi

INDEXER_TMP_DIR="$DAPP_ROOT/tmp/infra"
mkdir -p "$INDEXER_TMP_DIR"
INDEXER_CONFIG="$INDEXER_TMP_DIR/indexer.base-sepolia.yaml"

log_info "Preparing indexer config at $INDEXER_CONFIG"
cp "$TNT_CORE_DIR/indexer/config.yaml" "$INDEXER_CONFIG"

pnpm -C "$TNT_CORE_DIR/indexer" sync:config-from-manifest -- \
  --manifest "$MANIFEST" \
  --config "$INDEXER_CONFIG"

python3 - "$INDEXER_CONFIG" "$CHAIN_ID" "$RPC_URL" "$NETWORK" <<'PY'
import sys
path, chain_id, rpc_url, network = sys.argv[1:5]
lines = open(path).read().splitlines()
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped.startswith("name:"):
        lines[i] = f"name: tangle-indexer-{network}"
    elif stripped.startswith("id:"):
        prefix = line.split("id:")[0]
        lines[i] = f"{prefix}id: {chain_id}"
    elif stripped.startswith("url:"):
        prefix = line.split("url:")[0]
        lines[i] = f"{prefix}url: {rpc_url}"
open(path, "w").write("\n".join(lines) + "\n")
PY

if [[ ! -f "$TNT_CORE_DIR/indexer/generated/src/EventHandlers.res.js" ]]; then
  log_info "Indexer codegen missing; running envio codegen..."
  pnpm -C "$TNT_CORE_DIR/indexer" codegen
fi

ENVIO_RPC_VAR="ENVIO_RPC_URL_${CHAIN_ID}"

start_bg "indexer" env \
  "$ENVIO_RPC_VAR=$RPC_URL" \
  HASURA_EXTERNAL_PORT="$HASURA_EXTERNAL_PORT" \
  ENVIO_INDEXER_PORT="$ENVIO_INDEXER_PORT" \
  ENVIO_PG_PORT="$ENVIO_PG_PORT" \
  ENVIO_PG_USER="$ENVIO_PG_USER" \
  ENVIO_PG_PASSWORD="$ENVIO_PG_PASSWORD" \
  ENVIO_PG_DATABASE="$ENVIO_PG_DATABASE" \
  pnpm -C "$TNT_CORE_DIR/indexer" start -- --config "$INDEXER_CONFIG"

if [[ ! -d "$TNT_CORE_DIR/apps/claim-relayer" ]]; then
  log_error "Claim relayer not found at $TNT_CORE_DIR/apps/claim-relayer"
  exit 1
fi

start_bg "claim-relayer" env \
  RELAYER_PRIVATE_KEY="$RELAYER_PRIVATE_KEY" \
  MIGRATION_CONTRACT="$MIGRATION_CONTRACT" \
  RPC_URL="$RPC_URL" \
  CHAIN_ID="$CHAIN_ID" \
  PORT="$CLAIM_RELAYER_PORT" \
  bash -lc "cd \"$TNT_CORE_DIR/apps/claim-relayer\" && yarn dev"

start_bg "prover-api" env \
  PORT="$PROVER_API_PORT" \
  SP1_PROVER="${SP1_PROVER:-network}" \
  NETWORK_PRIVATE_KEY="$NETWORK_PRIVATE_KEY" \
  VERIFY_ONCHAIN="${VERIFY_ONCHAIN:-true}" \
  VERIFY_PROOF="${VERIFY_PROOF:-false}" \
  VERIFY_ONCHAIN_RPC_URL="$RPC_URL" \
  SP1_PROGRAM_VKEY="$PROGRAM_VKEY" \
  SP1_VERIFIER_ADDRESS="$VERIFIER_GATEWAY" \
  ALLOW_MOCK="${ALLOW_MOCK:-false}" \
  cargo run --manifest-path "$TNT_CORE_DIR/packages/migration-claim/sp1/Cargo.toml" -p tnt-claim-prover-api --release

start_dapp

wait

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${TNT_CORE_DIR:-}" ]]; then
  if [[ -d "$ROOT_DIR/../tnt-core" ]]; then
    TNT_CORE_DIR="$ROOT_DIR/../tnt-core"
  elif [[ -d "$ROOT_DIR/../../tnt-core" ]]; then
    TNT_CORE_DIR="$ROOT_DIR/../../tnt-core"
  elif [[ -d "/Users/drew/webb/tnt-core" ]]; then
    TNT_CORE_DIR="/Users/drew/webb/tnt-core"
  else
    echo "Error: TNT_CORE_DIR not found. Set TNT_CORE_DIR to your tnt-core repo." >&2
    exit 1
  fi
fi

TNT_CORE_DIR="$(cd "$TNT_CORE_DIR" && pwd)"

: "${BASE_SEPOLIA_RPC:?Missing BASE_SEPOLIA_RPC}"
: "${PRIVATE_KEY:?Missing PRIVATE_KEY}"

FULL_DEPLOY_CONFIG="${FULL_DEPLOY_CONFIG:-$TNT_CORE_DIR/deploy/config/base-sepolia.json}"
DEPLOY_MIGRATION="${DEPLOY_MIGRATION:-true}"
USE_MOCK_VERIFIER="${USE_MOCK_VERIFIER:-false}"
EXECUTE_AIRDROP="${EXECUTE_AIRDROP:-false}"
CLEAN="${CLEAN:-true}"

if [[ ! -f "$FULL_DEPLOY_CONFIG" ]]; then
  echo "Error: FULL_DEPLOY_CONFIG not found: $FULL_DEPLOY_CONFIG" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1; then
  echo "Error: jq and node are required" >&2
  exit 1
fi

MANIFEST_REL="$(jq -r '.manifest.path' "$FULL_DEPLOY_CONFIG")"
if [[ -z "$MANIFEST_REL" || "$MANIFEST_REL" == "null" ]]; then
  echo "Error: missing .manifest.path in $FULL_DEPLOY_CONFIG" >&2
  exit 1
fi

if [[ "$MANIFEST_REL" = /* ]]; then
  FULL_DEPLOY_MANIFEST="$MANIFEST_REL"
else
  FULL_DEPLOY_MANIFEST="$TNT_CORE_DIR/$MANIFEST_REL"
fi

MIGRATION_MANIFEST_PATH="${MIGRATION_MANIFEST_PATH:-$TNT_CORE_DIR/deployments/base-sepolia/migration.json}"

if [[ "$CLEAN" == "true" ]]; then
  rm -f "$FULL_DEPLOY_MANIFEST" "$MIGRATION_MANIFEST_PATH"
  rm -rf "$TNT_CORE_DIR/deployments/base-sepolia/evm-airdrop"
fi

if [[ "$DEPLOY_MIGRATION" == "true" && -z "${TNT_INITIAL_SUPPLY:-}" ]]; then
  TNT_INITIAL_SUPPLY="$(node -e "const fs=require('fs');const m=JSON.parse(fs.readFileSync('$TNT_CORE_DIR/packages/migration-claim/merkle-tree.json','utf8'));const e=JSON.parse(fs.readFileSync('$TNT_CORE_DIR/packages/migration-claim/evm-claims.json','utf8'));let t=0n;let f=0n;try{t=BigInt(JSON.parse(fs.readFileSync('$TNT_CORE_DIR/packages/migration-claim/treasury-carveout.json','utf8')).amount||'0');}catch{};try{f=BigInt(JSON.parse(fs.readFileSync('$TNT_CORE_DIR/packages/migration-claim/foundation-carveout.json','utf8')).amount||'0');}catch{};process.stdout.write((BigInt(m.totalValue)+BigInt(e.totalAmount)+t+f).toString());")"
  export TNT_INITIAL_SUPPLY
  echo "DEPLOY_MIGRATION=true: TNT_INITIAL_SUPPLY=$TNT_INITIAL_SUPPLY"
fi

echo "==> Deploying FullDeploy to Base Sepolia"
pushd "$TNT_CORE_DIR" >/dev/null
FULL_DEPLOY_CONFIG="$FULL_DEPLOY_CONFIG" \
PRIVATE_KEY="$PRIVATE_KEY" \
BASE_SEPOLIA_RPC="$BASE_SEPOLIA_RPC" \
forge script script/v2/FullDeploy.s.sol:FullDeploy \
  --rpc-url "$BASE_SEPOLIA_RPC" \
  --broadcast \
  --non-interactive
popd >/dev/null

if [[ ! -f "$FULL_DEPLOY_MANIFEST" ]]; then
  echo "Error: FullDeploy manifest not found: $FULL_DEPLOY_MANIFEST" >&2
  exit 1
fi

if [[ "$DEPLOY_MIGRATION" == "true" ]]; then
  if [[ "$USE_MOCK_VERIFIER" != "true" && "$USE_MOCK_VERIFIER" != "false" ]]; then
    echo "USE_MOCK_VERIFIER must be true|false (got: $USE_MOCK_VERIFIER)" >&2
    exit 1
  fi

  echo "==> Deploying migration on Base Sepolia"
  FULL_DEPLOY_MANIFEST="$FULL_DEPLOY_MANIFEST" \
  BASE_SEPOLIA_RPC="$BASE_SEPOLIA_RPC" \
  PRIVATE_KEY="$PRIVATE_KEY" \
  USE_MOCK_VERIFIER="$USE_MOCK_VERIFIER" \
  PROGRAM_VKEY="${PROGRAM_VKEY:-}" \
  SP1_VERIFIER="${SP1_VERIFIER:-}" \
  TREASURY_RECIPIENT="${TREASURY_RECIPIENT:-}" \
  FOUNDATION_RECIPIENT="${FOUNDATION_RECIPIENT:-}" \
  MIGRATION_OWNER="${MIGRATION_OWNER:-}" \
  MIGRATION_MANIFEST_PATH="$MIGRATION_MANIFEST_PATH" \
  bash "$TNT_CORE_DIR/scripts/deploy-migration-base-sepolia.sh" $( [[ "$EXECUTE_AIRDROP" == "true" ]] && echo "--airdrop" )
fi

if [[ -f "$MIGRATION_MANIFEST_PATH" ]]; then
  tnt_token="$(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));process.stdout.write(String(j.tntToken||''));" "$MIGRATION_MANIFEST_PATH")"
  migration_addr="$(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));process.stdout.write(String(j.tangleMigration||''));" "$MIGRATION_MANIFEST_PATH")"
  zk_verifier="$(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));process.stdout.write(String(j.zkVerifier||''));" "$MIGRATION_MANIFEST_PATH")"
  merkle_root="$(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));process.stdout.write(String(j.merkleRoot||''));" "$MIGRATION_MANIFEST_PATH")"
  credits_addr="$(node -e "const fs=require('fs');const p=process.argv[1];if(!p||!fs.existsSync(p)){process.stdout.write('');process.exit(0);}const j=JSON.parse(fs.readFileSync(p,'utf8'));process.stdout.write(String(j.credits||''));" "$FULL_DEPLOY_MANIFEST")"

  env_file="$ROOT_DIR/apps/tangle-dapp/.env.local"
  if [[ -f "$env_file" ]]; then
    sed -i.bak '/^VITE_TNT_TOKEN_ADDRESS=/d' "$env_file" 2>/dev/null || true
    sed -i.bak '/^VITE_TANGLE_MIGRATION_ADDRESS=/d' "$env_file" 2>/dev/null || true
    sed -i.bak '/^VITE_ZK_VERIFIER_ADDRESS=/d' "$env_file" 2>/dev/null || true
    sed -i.bak '/^VITE_MIGRATION_MERKLE_ROOT=/d' "$env_file" 2>/dev/null || true
    sed -i.bak '/^VITE_MIGRATION_RPC_URL=/d' "$env_file" 2>/dev/null || true
    sed -i.bak '/^VITE_CREDITS_ADDRESS_84532=/d' "$env_file" 2>/dev/null || true
    rm -f "$env_file.bak"
  fi

  cat >> "$env_file" << EOF

# Base Sepolia Migration (deployed $(date +%Y-%m-%d))
VITE_TNT_TOKEN_ADDRESS=$tnt_token
VITE_TANGLE_MIGRATION_ADDRESS=$migration_addr
VITE_ZK_VERIFIER_ADDRESS=$zk_verifier
VITE_MIGRATION_MERKLE_ROOT=$merkle_root
VITE_MIGRATION_RPC_URL=$BASE_SEPOLIA_RPC
${credits_addr:+VITE_CREDITS_ADDRESS_84532=$credits_addr}
EOF
fi

mkdir -p "$ROOT_DIR/apps/tangle-dapp/public/data"
cp "$TNT_CORE_DIR/packages/migration-claim/merkle-tree.json" \
  "$ROOT_DIR/apps/tangle-dapp/public/data/migration-proofs.json"

credits_tree="$TNT_CORE_DIR/packages/credits/credits-tree.json"
if [[ -f "$credits_tree" ]]; then
  cp "$credits_tree" "$ROOT_DIR/apps/tangle-dapp/public/data/credits-tree.json"
fi

echo ""
echo "Done."
echo "FullDeploy manifest: $FULL_DEPLOY_MANIFEST"
if [[ -f "$MIGRATION_MANIFEST_PATH" ]]; then
  echo "Migration manifest: $MIGRATION_MANIFEST_PATH"
fi

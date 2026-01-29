# Local Blueprint E2E Guide for Tangle Cloud

This guide details all the steps required to deploy a blueprint locally and view it in the tangle-cloud app. It combines the blueprint deployment process with the indexer and frontend setup.

> **Note**: This guide focuses on deploying a blueprint and viewing it in the UI. For full operator functionality (running blueprints, submitting jobs), see the [LOCAL_E2E_TEST_PLAN.md](https://github.com/tangle-network/blueprint/blob/main/docs/cli-testing/LOCAL_E2E_TEST_PLAN.md) in the blueprint repo.

## Prerequisites

### Required Repositories

You need these three repositories as siblings:

```
parent-directory/
├── blueprint/          # Blueprint SDK repo (https://github.com/tangle-network/blueprint)
├── tnt-core/           # Tangle contracts repo (https://github.com/tangle-network/tnt-core)
└── dapp/               # This repo (https://github.com/tangle-network/dapp)
```

### Required Tools

```bash
# Foundry (for Anvil and forge)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Homebrew Protobuf (macOS only)
brew install protobuf

# cargo-tangle CLI (from blueprint repo)
cd /path/to/blueprint
cargo install cargo-tangle --path ./cli --force

# Node.js v18.18.x or later
# Yarn v4.7.0
# Docker (for Envio indexer)
# pnpm (for indexer)
# psql (PostgreSQL client)
```

### macOS Environment Variables

Required for macOS ARM64 compilation:

```bash
export MACOSX_DEPLOYMENT_TARGET=14.0
export SDKROOT=$(xcrun --show-sdk-path)
export CXXFLAGS="-isysroot $SDKROOT -I$SDKROOT/usr/include/c++/v1 -stdlib=libc++"
export PROTOC=/opt/homebrew/bin/protoc
```

> **Tip**: Add these to your shell profile (`~/.zshrc` or `~/.bashrc`).

---

## Terminal Overview

This guide requires **5 terminals**:

| Terminal | Purpose | Steps |
|----------|---------|-------|
| Terminal 1 | Anvil (local blockchain) | Step 2 |
| Terminal 2 | HTTP server (artifact hosting) | Step 3 |
| Terminal 3 | CLI commands (deploy) | Steps 4-6 |
| Terminal 4 | Envio indexer | Step 7 |
| Terminal 5 | tangle-cloud dev server | Step 8 |

---

## Key Accounts (Anvil Deterministic)

| Index | Address | Private Key | Role |
|-------|---------|-------------|------|
| 0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` | Contract Deployer |
| 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` | Blueprint Owner |

> **Blueprint Owner**: The blueprint will be owned by account index 1 (`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`) since that's the keystore used for the deploy transaction.

---

## Step 1: Create a New Blueprint

> Run in any terminal. Create the blueprint **outside** the blueprint SDK repo.

```bash
# Navigate to parent directory (outside the blueprint SDK repo)
cd /path/to/parent-directory

# Create a new blueprint
cargo tangle blueprint create \
  --name hello-blueprint \
  --skip-prompts \
  --project-description "Hello Blueprint for local E2E testing" \
  --project-authors "Tangle"

cd hello-blueprint
```

### Fix Rust Version (if needed)

```bash
# Update to Rust 1.88 if needed
sed -i '' 's/channel = "1.86"/channel = "1.88"/' rust-toolchain.toml
```

### Use Local Blueprint SDK

Update `hello-blueprint-bin/Cargo.toml`:
```bash
sed -i '' 's|blueprint-sdk = { git = "https://github.com/tangle-network/blueprint", branch = "v2"|blueprint-sdk = { path = "../../blueprint/crates/sdk"|' hello-blueprint-bin/Cargo.toml
```

Update `hello-blueprint-lib/Cargo.toml`:
```bash
sed -i '' 's|blueprint-sdk = { git = "https://github.com/tangle-network/blueprint", branch = "v2"|blueprint-sdk = { path = "../../blueprint/crates/sdk"|' hello-blueprint-lib/Cargo.toml
sed -i '' 's|blueprint-anvil-testing-utils = { git = "https://github.com/tangle-network/blueprint", branch = "v2" }|blueprint-anvil-testing-utils = { path = "../../blueprint/crates/testing-utils/anvil" }|' hello-blueprint-lib/Cargo.toml
```

---

## Step 2: Start Anvil

```bash
# Terminal 1
anvil --host 0.0.0.0 --port 8545 --base-fee 0 --gas-price 0 --gas-limit 100000000 --hardfork cancun --code-size-limit 50000
```

Keep this terminal running.

---

## Step 3: Package and Serve Blueprint Artifacts

> **Important**: The HTTP server must include CORS headers, otherwise the tangle-cloud frontend cannot load metadata. This step uses a custom Python script with CORS support instead of the basic `python3 -m http.server`.

```bash
# Terminal 2
cd /path/to/hello-blueprint

# Build the binary
cargo build --release -p hello-blueprint-bin

# Create dist directory and package
mkdir -p ./dist

# Note: The target directory is inside hello-blueprint when building there
tar -cJf ./dist/hello-blueprint.tar.xz -C ./target/release hello-blueprint

# Compute SHA256 hash of the binary
SHA256=$(shasum -a 256 ./target/release/hello-blueprint | awk '{print $1}')
echo "Binary SHA256: $SHA256"

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case "$ARCH" in
  x86_64) ARCH="amd64" ;;
  aarch64|arm64) ARCH="arm64" ;;
esac

# Create definition.json
cat > ./dist/definition.json << EOF
{
  "metadata_uri": "http://localhost:8081/metadata.json",
  "manager": "0x0000000000000000000000000000000000000000",
  "metadata": {
    "name": "hello-blueprint",
    "description": "Hello Blueprint for local development",
    "author": "Tangle",
    "category": "Test",
    "license": "MIT"
  },
  "jobs": [
    {
      "name": "hello",
      "description": "Greets the caller with a personalized message",
      "params_schema": "0x",
      "result_schema": "0x"
    }
  ],
  "sources": [{
    "kind": "native",
    "fetcher": "http",
    "entrypoint": "./hello-blueprint",
    "remote": {
      "dist_url": "http://localhost:8081/dist.json",
      "archive_url": "http://localhost:8081/hello-blueprint.tar.xz"
    },
    "binaries": [{
      "name": "hello-blueprint",
      "arch": "$ARCH",
      "os": "$OS",
      "sha256": "$SHA256"
    }]
  }],
  "supported_memberships": ["dynamic"]
}
EOF

# Create dist.json
cat > ./dist/dist.json << EOF
{
  "dist_version": "0.0.0",
  "announcement_title": "",
  "announcement_changelog": "",
  "announcement_github_body": "",
  "announcement_is_prerelease": false,
  "releases": [],
  "artifacts": {
    "hello-blueprint.tar.xz": {
      "name": "hello-blueprint.tar.xz",
      "kind": "executable-zip",
      "target_triples": ["${ARCH}-apple-darwin"],
      "assets": [
        {
          "name": "hello-blueprint",
          "kind": "executable"
        }
      ],
      "checksum": "$SHA256"
    }
  }
}
EOF

# Create metadata.json for the frontend to fetch
cat > ./dist/metadata.json << EOF
{
  "name": "hello-blueprint",
  "description": "Hello Blueprint for local development",
  "author": "Tangle",
  "category": "Test",
  "license": "MIT"
}
EOF

# Create CORS-enabled HTTP server script
# (Required because the frontend at localhost:4300 needs to fetch from localhost:8081)
cat > ./dist/cors_server.py << 'PYEOF'
#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
    server = HTTPServer(('0.0.0.0', port), CORSRequestHandler)
    print(f'Serving on port {port} with CORS enabled...')
    server.serve_forever()
PYEOF

# Start CORS-enabled HTTP server
cd ./dist
python3 cors_server.py 8081
```

Keep this terminal running.

### Verify CORS Headers

In another terminal, verify CORS headers are present:
```bash
curl -I http://localhost:8081/metadata.json
```

You should see these headers in the response:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: *
```

> **Why CORS?** The tangle-cloud frontend runs at `localhost:4300` and needs to fetch metadata from `localhost:8081`. Without CORS headers, the browser blocks these cross-origin requests, causing "Failed to load metadata" errors.

---

## Step 4: Deploy Contracts

```bash
# Terminal 3
cd /path/to/tnt-core

forge script script/v2/DeployContractsOnly.s.sol:DeployContractsOnly \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --disable-code-size-limit \
  -vvv

# Save addresses (deterministic with Anvil)
export TANGLE=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
export RESTAKING=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
export STATUS_REGISTRY=0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf
```

---

## Step 5: Setup Keystore

```bash
# Terminal 3 (continue)
cd /path/to/hello-blueprint

mkdir -p ./deployer-keystore

cargo tangle key import \
  --key-type ecdsa \
  --secret 59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --keystore-path ./deployer-keystore \
  --protocol tangle-evm
```

> **Note**: This creates a keystore for address `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`, which will become the **blueprint owner**.

---

## Step 6: Deploy Blueprint On-Chain

```bash
# Terminal 3 (continue)
cd /path/to/hello-blueprint

# Create settings.env
cat > ./settings.env << EOF
HTTP_RPC_URL=http://127.0.0.1:8545
WS_RPC_URL=ws://127.0.0.1:8546
KEYSTORE_PATH=./deployer-keystore
BLUEPRINT_KEYSTORE_URI=./deployer-keystore
TANGLE_CONTRACT=$TANGLE
RESTAKING_CONTRACT=$RESTAKING
STATUS_REGISTRY_CONTRACT=$STATUS_REGISTRY
BLUEPRINT_ID=0
SERVICE_ID=0
EOF

# Deploy blueprint
cargo tangle blueprint deploy tangle \
  --network testnet \
  --definition ./dist/definition.json \
  --settings-file ./settings.env

export BLUEPRINT_ID=0
```

At this point, your blueprint is deployed on the local Anvil chain.

> **Blueprint Owner**: The blueprint owner is `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (the address corresponding to the keystore private key).

---

## Step 7: Start the Envio Indexer

The tangle-cloud app fetches blueprints from an Envio indexer, not directly from the chain. You must start the indexer to see blueprints in the UI.

> **Timing**: The indexer can be started before or after deploying the blueprint. It indexes historical blocks, so it will catch up with past events.

```bash
# Terminal 4
cd /path/to/tnt-core

# Install indexer dependencies (first time only)
cd indexer
pnpm install
cd ..

# Start the indexer
./scripts/indexer-local.sh start --rpc-url http://127.0.0.1:8545 --chain-id 31337
```

This will:
- Start Docker containers for Postgres and Hasura
- Run database migrations
- Start the Envio indexer process
- Expose GraphQL at `http://localhost:8080/v1/graphql`

Verify the indexer is running:
```bash
./scripts/indexer-local.sh status
```

Wait for the indexer to sync (check logs at `/tmp/tnt-core-indexer-local/indexer.log`).

### Known Issue: Indexer Stuck at "Reorg threshold reached"

The Envio indexer may get stuck when running against Anvil, showing only:
```
Reorg threshold reached
No new blocks detected within 20s...
```

This happens because Anvil doesn't produce blocks automatically after transactions, and the indexer's reorg protection waits for block confirmations.

**Workaround Option 1: Mine extra blocks**

After deploying the blueprint, mine several blocks to push past the reorg threshold:
```bash
# Mine 10 blocks
for i in {1..10}; do
  curl -s http://127.0.0.1:8545 -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"evm_mine","params":[],"id":1}'
done
```

**Workaround Option 2: Manual database insert**

If the indexer still doesn't pick up the blueprint, you can manually insert it:
```bash
# Get the blueprint owner address (lowercase)
OWNER="0x70997970c51812dc3a010c7d01b50e0d17dc79c8"

# Insert blueprint into the database
PGPASSWORD="testing" psql -h localhost -p 5433 -U postgres -d envio-dev -c "
INSERT INTO \"Blueprint\" (
  id, \"blueprintId\", \"metadataUri\", owner, manager, active, \"operatorCount\", \"createdAt\", \"updatedAt\"
) VALUES (
  '0', '0', 'http://localhost:8081/metadata.json', '$OWNER',
  '0x0000000000000000000000000000000000000000', true, 0,
  EXTRACT(EPOCH FROM NOW())::bigint, EXTRACT(EPOCH FROM NOW())::bigint
) ON CONFLICT (id) DO UPDATE SET
  \"metadataUri\" = EXCLUDED.\"metadataUri\",
  owner = EXCLUDED.owner;
"
```

Verify the data is in the database:
```bash
curl -s http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ Blueprint { id blueprintId metadataUri owner } }"}'
```

---

## Step 8: Start tangle-cloud

```bash
# Terminal 5
cd /path/to/dapp

# Create local environment file
cat > apps/tangle-cloud/.env.local << EOF
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
EOF

# Install dependencies (if not already done)
yarn install

# Start tangle-cloud
yarn start:tangle-cloud
```

The app will start at `http://localhost:4300`.

---

## Step 9: View Your Blueprint

1. Open `http://localhost:4300` in your browser
2. Navigate to the Blueprints page
3. Your "hello-blueprint" should appear in the list with:
   - Name: "hello-blueprint"
   - Description: "Hello Blueprint for local development"
   - Author: "Tangle"
   - Category: "Test"

**Blueprint Owner**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

If the blueprint doesn't appear:
- Check that the indexer has synced (check logs)
- Verify the GraphQL endpoint is working: `curl http://localhost:8080/v1/graphql -H "Content-Type: application/json" -d '{"query":"{ Blueprint { id blueprintId } }"}'`
- Check browser console for errors

If metadata shows "Failed to load metadata":
- Verify the HTTP server has CORS headers: `curl -I http://localhost:8081/metadata.json`
- Ensure you're using the CORS-enabled server script, not plain `python3 -m http.server`

---

## Summary: Port Usage

| Port | Service |
|------|---------|
| 8545 | Anvil RPC |
| 8546 | Anvil WebSocket |
| 8081 | Blueprint artifacts HTTP server (with CORS) |
| 8080 | Hasura GraphQL (Envio indexer) |
| 5433 | PostgreSQL (Envio indexer) |
| 4300 | tangle-cloud dev server |

---

## Cleanup

```bash
# Stop the indexer
cd /path/to/tnt-core
./scripts/indexer-local.sh stop

# Stop other services (Ctrl+C in respective terminals)
# - Anvil (Terminal 1)
# - HTTP server (Terminal 2)
# - tangle-cloud (Terminal 5)

# Clean up hello-blueprint
cd /path/to/hello-blueprint
rm -rf ./deployer-keystore ./dist ./data ./target
cd ..
rm -rf hello-blueprint
```

---

## Troubleshooting

### Blueprint not appearing in tangle-cloud

1. **Check indexer is running**: `./scripts/indexer-local.sh status`
2. **Check indexer logs**: `tail -f /tmp/tnt-core-indexer-local/indexer.log`
3. **Query GraphQL directly**:
   ```bash
   curl http://localhost:8080/v1/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"{ Blueprint { id blueprintId metadataUri owner } }"}'
   ```
4. **Verify metadata URL is accessible**: `curl http://localhost:8081/metadata.json`

### "Failed to load metadata" in the UI

This is a **CORS issue**. The browser blocks cross-origin requests from `localhost:4300` to `localhost:8081`.

**Fix**: Ensure you're using the CORS-enabled HTTP server script from Step 3, not plain `python3 -m http.server`.

Verify CORS headers are present:
```bash
curl -I http://localhost:8081/metadata.json | grep -i access-control
```

Expected output:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: *
```

If headers are missing, restart the HTTP server with the `cors_server.py` script.

### Indexer won't start

1. **Check Docker is running**: `docker ps`
2. **Check port conflicts**: `lsof -i :8080` and `lsof -i :5433`
3. **Reset and restart**:
   ```bash
   ./scripts/indexer-local.sh reset
   ./scripts/indexer-local.sh start --rpc-url http://127.0.0.1:8545 --chain-id 31337
   ```

### Indexer stuck at "Reorg threshold reached"

See the "Known Issue" section in Step 7. Either:
1. Mine extra blocks using `evm_mine`
2. Manually insert the blueprint data into PostgreSQL

### GraphQL errors

If you see "Failed to fetch" errors in tangle-cloud:
1. Ensure `VITE_GRAPHQL_ENDPOINT` is set correctly in `.env.local`
2. Check the indexer containers are running: `docker ps | grep -E "hasura|postgres"`
3. Restart tangle-cloud after changing environment variables

### Build errors in Step 3

If `cargo build` fails with missing dependencies:
1. Ensure macOS environment variables are set (see Prerequisites)
2. Try cleaning and rebuilding: `cargo clean && cargo build --release -p hello-blueprint-bin`

### tar command fails

If you see `tar: could not chdir to '../target/release'`:
- The target directory location depends on where you run the build
- When building inside `hello-blueprint/`, use `./target/release` (not `../target/release`)

---

## FAQ

### Who owns the deployed blueprint?

The blueprint owner is the address that signs the deploy transaction. In this guide, that's `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (the keystore created in Step 5).

### Do I need to register as an operator to deploy a blueprint?

No. Blueprint creation is permissionless - anyone can deploy a blueprint. Operator registration is only needed if you want to run/operate the blueprint.

### Can I start the indexer after deploying the blueprint?

Yes. The Envio indexer scans historical blocks, so it will index past `BlueprintCreated` events when it starts.

### Why do I need CORS headers on the HTTP server?

The tangle-cloud frontend runs at `http://localhost:4300` and fetches blueprint metadata from `http://localhost:8081`. Browsers enforce the Same-Origin Policy, blocking requests between different origins unless the server explicitly allows it via CORS headers.

### Can I use a different port for the HTTP server?

Yes, but you'll need to update:
1. The `metadata_uri`, `dist_url`, and `archive_url` in `definition.json`
2. The port in the `cors_server.py` command
3. Any manual database inserts that reference the metadata URL

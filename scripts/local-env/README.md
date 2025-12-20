# Local Simulation Environment

This directory contains scripts to run a fully simulatable local environment for dApp development and testing.

## Scripts

| Script | Description |
|--------|-------------|
| `start-local-env.sh` | Start Anvil, deploy TNT contracts, run indexer & claim relayer |
| `deploy-migration.sh` | Deploy TangleMigration contracts for TNT token claims |
| `activity-generator.mjs` | Generate simulated restaking activity |

## Prerequisites

- [Foundry](https://getfoundry.sh) (anvil, forge)
- [Docker](https://docker.com)
- [Node.js](https://nodejs.org) v18+
- [pnpm](https://pnpm.io)
- Access to the `tnt-core` repository (sibling directory to dapp)

## Quick Start

### Option 1: Full Environment (Recommended)

Start everything with a single command:

```bash
# From the dapp root directory
./scripts/local-env/start-local-env.sh

# Or if tnt-core is in a different location
TNT_CORE_DIR=/path/to/tnt-core ./scripts/local-env/start-local-env.sh
```

This will:
1. Start Anvil (local Ethereum node) on port 8545 with chain ID 31337
2. Deploy all TNT contracts
3. Deploy the migration contracts and copy proofs
4. Register the TNT ERC20 as a restaking asset so it appears in the dApp
5. Start the claim relayer for gasless migration claims (port 3001 by default)
6. Start the Envio indexer with PostgreSQL
7. Run initial activity generation
8. Start continuous activity generator
9. Launch an interactive CLI for managing components

### Option 2: Manual Setup

If you prefer to run components separately:

```bash
# Terminal 1: Start Anvil
anvil --chain-id 31337 --block-time 1 --base-fee 0 --gas-limit 30000000

# Terminal 2: Deploy contracts (from tnt-core directory)
cd ../tnt-core
forge script script/v2/LocalTestnet.s.sol:LocalTestnetSetup \
  --rpc-url http://localhost:8545 --broadcast --slow

# Terminal 3: Start indexer (from tnt-core/indexer directory)
cd ../tnt-core/indexer
cp config.local.yaml config.yaml
docker compose up -d
pnpm install && pnpm codegen
ENVIO_RPC_URL_31337=http://host.docker.internal:8545 pnpm dev

# Terminal 4: Run activity generator
node scripts/local-env/activity-generator.mjs
```

### Option 3: Activity Generator Only

If the environment is already running:

```bash
RPC_URL=http://localhost:8545 node scripts/local-env/activity-generator.mjs
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TNT_CORE_DIR` | Auto-detected | Path to tnt-core repository |
| `RPC_URL` | `http://localhost:8545` | Anvil RPC endpoint |
| `ACTIVITY_INTERVAL_MS` | `10000` | Interval between activities (ms) |
| `CLAIM_RELAYER_PORT` | `3001` | Port for the gasless claim relayer API |
| `CLAIM_RELAYER_PRIVATE_KEY` | Anvil account #1 | Private key the relayer uses to pay gas |

### dApp Config

Create `.env.local` in the app root (e.g., `apps/tangle-dapp/.env.local`):

```env
VITE_ENVIO_MAINNET_ENDPOINT=http://localhost:8080/v1/graphql
VITE_ENVIO_TESTNET_ENDPOINT=http://localhost:8080/v1/graphql
VITE_CLAIM_RELAYER_URL=http://localhost:3001
```

## Contract Addresses

These are deterministic addresses from Anvil's default deployer:

| Contract | Address |
|----------|---------|
| Tangle | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |
| MultiAssetDelegation | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| OperatorStatusRegistry | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` |

## Interactive CLI

Once the environment is running, you'll have access to an interactive CLI:

```
local-env> help

Activity Generator:
  activity restart    - Restart the activity generator
  activity stop       - Stop the activity generator
  activity start      - Start the activity generator

Indexer:
  indexer restart     - Restart the indexer process
  indexer stop        - Stop the indexer
  indexer clear       - Clear indexer state (then restart to re-sync)

Docker:
  docker down         - Run docker compose down -v
  docker up           - Run docker compose up -d
  docker restart      - Restart docker containers

Info:
  status              - Show status of all components
  addresses           - Show contract addresses
  accounts            - Show development accounts with private keys
  logs deploy         - Show deployment logs

Other:
  help                - Show this help
  quit, exit, q       - Exit and cleanup
```

## Activity Generator

The activity generator (`activity-generator.mjs`) simulates user activity:

- **Deposits**: Native ETH deposits to the restaking protocol
- **Delegations**: Delegating deposited assets to operators
- **Operator Registrations**: New operators joining the network

Activities are weighted:
- 40% deposits
- 30% delegations
- 20% multi-deposits (batch)
- 10% operator registrations

## TNT as a Restaked Asset

When `start-local-env.sh` runs (or when you resume a session) it automatically registers the TNT ERC20 token with the local `MultiAssetDelegation` contract. This ensures TNT shows up in the “Restake Assets” list inside the dApp and lets you restake the token immediately. If you redeploy contracts manually and need TNT again, rerun the local-env script (or `resume`) so it can re-register the asset.

## Querying the Indexer

Once running, you can query the GraphQL endpoint:

```bash
# Get all points accounts
curl http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ pointsAccounts(first: 10, orderBy: leaderboardPoints, orderDirection: desc) { id totalPoints leaderboardPoints } }"}'

# Get operators
curl http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ operators { id restakingStake restakingStatus } }"}'

# Get delegators with positions
curl http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ delegators { id totalDeposited totalDelegated assetPositions { token totalDeposited } } }"}'
```

## Troubleshooting

### Anvil won't start
```bash
# Check if port is in use
lsof -i:8545
# Kill existing process
lsof -ti:8545 | xargs kill -9
```

### Indexer not connecting
```bash
# Check Docker containers
docker compose ps
# View indexer logs
tail -f /tmp/indexer.log
```

### No activity showing up
```bash
# Check Anvil is receiving transactions
tail -f /tmp/anvil.log
# Verify contracts are deployed
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "owner()(address)" --rpc-url http://localhost:8545
```

### Wallet shows 0 balance
Some wallet extensions cache balances. Make sure the wallet is connected to `Localhost 8545` (chain ID `31337`) and that you imported one of the default Anvil private keys. If it still displays zero, run `fund <your-address>` inside the local-env CLI to top the account up, then refresh or reset the account in the wallet UI.

## Logs

- Anvil: `/tmp/anvil.log`
- Indexer: `/tmp/indexer.log`
- Deployment: `/tmp/deploy.log`
- Migration: `/tmp/migration-deploy.log`
- Claim relayer: `/tmp/claim-relayer.log`
- Scenario: `/tmp/scenario.log`

---

## TNT Migration Claim Setup

The migration claim system allows Substrate address holders to claim TNT tokens on EVM by proving key ownership via ZK proofs.

### Deploy Migration Contracts

After starting the local environment, deploy the migration contracts:

```bash
# From the dapp root directory
./scripts/local-env/deploy-migration.sh
```

This will:
1. Build and deploy TNT token, TangleMigration, and MockZKVerifier contracts (from `tnt-core/packages/migration-claim`)
2. Fund TangleMigration with the Substrate Merkle total from `merkle-tree.json`
3. Copy `merkle-tree.json` to `apps/tangle-dapp/public/data/migration-proofs.json`
4. Update `apps/tangle-dapp/.env.local` with contract addresses

### Migration Contract Addresses

After deployment, you'll see addresses like:
| Contract | Address |
|----------|---------|
| TNT Token | `0x...` (printed by script) |
| TangleMigration | `0x...` (printed by script) |
| MockZKVerifier | `0x...` (printed by script) |

### Test the Migration Claim

1. Start the dApp:
   ```bash
   yarn start:tangle-dapp
   ```

2. Navigate to: http://localhost:5173/claim/migration

3. Test with any SS58 address from the proofs file:
   ```
   tgFbShs5bUXZ8bcFfHkRm5vDbUQbUR3QQNhQktuK2mCW19qCR
   tgDj7AtseoEFPvVGTQowV6x1YCTfDQ5Ms7FyiJ2P273za9tik
   ```

### Migration Stats

Pull stats directly from `tnt-core/packages/migration-claim/merkle-tree.json` and `evm-claims.json`.
These files are the source of truth for totals and Merkle root.

### Environment Variables

The deploy script adds these to `apps/tangle-dapp/.env.local`:

```env
VITE_TNT_TOKEN_ADDRESS=0x...
VITE_TANGLE_MIGRATION_ADDRESS=0x...
VITE_ZK_VERIFIER_ADDRESS=0x...
VITE_MIGRATION_MERKLE_ROOT=0x...
VITE_MIGRATION_PROOFS_URL=/data/migration-proofs.json
```

### Full Local Setup Sequence

```bash
# 1. Start local environment (Anvil + indexer)
./scripts/local-env/start-local-env.sh

# 2. In another terminal, deploy migration contracts
./scripts/local-env/deploy-migration.sh

# 3. Start the dApp
yarn start:tangle-dapp

# 4. Test at http://localhost:5173/claim/migration
```

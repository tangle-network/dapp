# Local Simulation Environment

This directory contains scripts to run a fully simulatable local environment for dApp development and testing.

## Scripts

| Script                            | Description                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `start-local-env.sh`              | Start Anvil, deploy TNT contracts, run indexer & claim relayer                                 |
| `deploy-migration.sh`             | Deploy TangleMigration contracts for TNT token claims                                          |
| `activity-generator.mjs`          | Generate simulated staking activity                                                            |
| `check-local-staking-actions.mjs` | Prove deposit, delegate, rewards claim, undelegate, and withdrawal against local TNT contracts |

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
4. Register the TNT ERC20 as a staking asset so it appears in the dApp
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

### Local Staking Action Gates

Use the local staking gates when you need deterministic proof that every staking
write used by the dApp succeeds on LocalTestnet:

```bash
./scripts/local-env/start-local-env.sh
yarn test:staking:local
yarn test:staking:local-ui
```

`yarn test:staking:local` proves the contracts directly. It requires Anvil chain
ID `31337`, resolves the current local proxy addresses from environment
variables, `/tmp/deploy.log`, `/tmp/local-env-cache/addresses.env`, then the
checked-in local defaults, and executes:

1. `depositWithLock`
2. `delegateWithOptions`
3. `RewardVaults.distributeRewards` plus `claimDelegatorRewardsBatch`
4. `scheduleDelegatorUnstake` plus `executeDelegatorUnstake`
5. `scheduleWithdraw` plus `executeWithdraw`

It advances Anvil time and staking rounds for delayed unstake/withdrawal
execution. A blocker state is a failure here, not a pass.

`yarn test:staking:local-ui` proves the same user-facing path through the dApp
and MetaMask. It launches Chromium under Xvfb, connects MetaMask to local Anvil,
drives deposit, delegate, claim rewards, schedule/execute undelegate, and
schedule/execute withdrawal through stable `data-testid` selectors, then verifies
each result through RPC reads.

The exploratory browser wallet suite still exists for broader launch signoff.
It can use an LLM agent, so keep it separate from the deterministic local staking
release gate:

```bash
yarn test:wallet-flows:staking:local
yarn test:wallet-flows:staking:gate
```

The combined deterministic local release gate is:

```bash
yarn test:staking:local-release
```

## Configuration

### Environment Variables

| Variable                    | Default                 | Description                             |
| --------------------------- | ----------------------- | --------------------------------------- |
| `TNT_CORE_DIR`              | Auto-detected           | Path to tnt-core repository             |
| `RPC_URL`                   | `http://localhost:8545` | Anvil RPC endpoint                      |
| `ACTIVITY_INTERVAL_MS`      | `10000`                 | Interval between activities (ms)        |
| `CLAIM_RELAYER_PORT`        | `3001`                  | Port for the gasless claim relayer API  |
| `CLAIM_RELAYER_PRIVATE_KEY` | Anvil account #1        | Private key the relayer uses to pay gas |

### dApp Config

Create `.env.local` in the app root (e.g., `apps/tangle-dapp/.env.local`):

```env
VITE_ENVIO_MAINNET_ENDPOINT=http://localhost:8080/v1/graphql
VITE_ENVIO_TESTNET_ENDPOINT=http://localhost:8080/v1/graphql
VITE_CLAIM_RELAYER_URL=http://localhost:3001
```

## Contract Addresses

These are the current local defaults for the checked-in LocalTestnet deploy.
`start-local-env.sh` writes the canonical addresses for the active Anvil state
to `/tmp/local-env-cache/addresses.env`; use that cache rather than assuming a
nonce order when the deployment script changes.

| Contract                | Address                                      |
| ----------------------- | -------------------------------------------- |
| Tangle                  | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` |
| MultiAssetDelegation    | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |
| OperatorStatusRegistry  | `0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154` |
| RewardVaults            | `0x0355B7B8cb128fA5692729Ab3AAa199C1753f726` |
| InflationPool           | `0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8` |
| Credits                 | `0xDC11f7E700A4c898AE5CAddB1082cFfa76512aDD` |
| LiquidDelegationFactory | `0xf090f16dEc8b6D24082Edd25B1C8D26f2bC86128` |

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

- **Deposits**: Native ETH deposits to the staking protocol
- **Delegations**: Delegating deposited assets to operators
- **Operator Registrations**: New operators joining the network

Activities are weighted:

- 40% deposits
- 30% delegations
- 20% multi-deposits (batch)
- 10% operator registrations

## Tier 2 Blueprint UI Catalog

The local environment can seed the AI blueprint catalog used by Tangle Cloud's
secure Tier 2 hosted UI. The catalog pulls the real
`metadata/blueprint-metadata.json` files from the sibling blueprint repos,
registers each blueprint on the local EVM Tangle contract, pins the canonical
metadata hash onchain, signs the metadata with the local blueprint owner key,
registers two local protocol operators, and creates one approved service
request per blueprint.

Start local contracts and the indexer first:

```bash
./scripts/local-env/start-local-env.sh
```

Then run the catalog seeder and metadata server from the dapp root:

```bash
yarn local:blueprint-ui-catalog
```

This command serves signed metadata at `http://127.0.0.1:3337/*.json`. Keep it
running while using Tangle Cloud locally so the browser can fetch and verify the
metadata. The dapp will downgrade to the generic host if the metadata server is
stopped, the onchain hash does not match, or the owner signature does not verify.

Useful split commands:

```bash
yarn local:blueprint-ui-catalog:seed   # Register/update local protocol fixtures
yarn local:blueprint-ui-catalog:serve  # Serve already-generated metadata JSON
```

To view the seeded blueprints, start Tangle Cloud with local chain forcing:

```bash
VITE_FORCE_LOCAL_CHAIN=true yarn start:tangle-cloud
```

Connect a wallet to `Localhost 8545` (chain ID `31337`) and use the local Envio
endpoint at `http://localhost:8080/v1/graphql`. These fixtures prove the
onchain blueprint/operator/service lifecycle and Tier 2 UI ingestion path; they
do not start the actual inference or sandbox runtime binaries for each
blueprint.

## TNT as a Staking Asset

When `start-local-env.sh` runs (or when you resume a session) it automatically registers the TNT ERC20 token with the local `MultiAssetDelegation` contract. This ensures TNT shows up in the “Staking Assets” list inside the dApp and lets you stake the token immediately. If you redeploy contracts manually and need TNT again, rerun the local-env script (or `resume`) so it can re-register the asset.

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
  -d '{"query": "{ operators { id } }"}'

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

2. Navigate to: `localhost:5173/claim/migration`

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

# 4. Test at localhost:5173/claim/migration
```

# Local Simulation Environment

This directory contains scripts to run a fully simulatable local environment for leaderboard development and testing.

## Prerequisites

- [Foundry](https://getfoundry.sh) (anvil, forge)
- [Docker](https://docker.com)
- [Node.js](https://nodejs.org) v18+
- [pnpm](https://pnpm.io)
- Access to the `tnt-core` repository

## Quick Start

### Option 1: Full Environment (Recommended)

Start everything with a single command:

```bash
# From the leaderboard app directory
TNT_CORE_DIR=../../../tnt-core ./scripts/start-local-env.sh
```

This will:
1. Start Anvil (local Ethereum node) on port 8545
2. Deploy all TNT contracts
3. Start the Envio indexer with PostgreSQL
4. Run initial activity generation
5. Start continuous activity generator

### Option 2: Manual Setup

If you prefer to run components separately:

```bash
# Terminal 1: Start Anvil
anvil --chain-id 84532 --block-time 1 --base-fee 0 --gas-limit 30000000

# Terminal 2: Deploy contracts (from tnt-core directory)
cd ../../../tnt-core
forge script script/v2/LocalTestnet.s.sol:LocalTestnetSetup \
  --rpc-url http://localhost:8545 --broadcast --slow

# Terminal 3: Start indexer (from tnt-core/indexer directory)
cd ../../../tnt-core/indexer
cp config.local.yaml config.yaml
docker compose up -d
pnpm install && pnpm codegen
ENVIO_RPC_URL_84532=http://host.docker.internal:8545 pnpm dev

# Terminal 4: Run activity generator (from leaderboard directory)
node scripts/activity-generator.mjs
```

### Option 3: Activity Generator Only

If the environment is already running:

```bash
RPC_URL=http://localhost:8545 node scripts/activity-generator.mjs
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TNT_CORE_DIR` | `../../../tnt-core` | Path to tnt-core repository |
| `RPC_URL` | `http://localhost:8545` | Anvil RPC endpoint |
| `ACTIVITY_INTERVAL_MS` | `10000` | Interval between activities (ms) |

### Leaderboard App Config

Create `.env.local` in the leaderboard app root:

```env
VITE_ENVIO_MAINNET_ENDPOINT=http://localhost:8080/v1/graphql
VITE_ENVIO_TESTNET_ENDPOINT=http://localhost:8080/v1/graphql
```

## Contract Addresses

These are deterministic addresses from Anvil's default deployer:

| Contract | Address |
|----------|---------|
| Tangle | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |
| MultiAssetDelegation | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| OperatorStatusRegistry | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` |

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

## Logs

- Anvil: `/tmp/anvil.log`
- Indexer: `/tmp/indexer.log`
- Deployment: `/tmp/deploy.log`
- Scenario: `/tmp/scenario.log`

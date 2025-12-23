# Infra Runner

One-command launcher for local dev or a single machine running Base Sepolia/Base mainnet infra.

## Quick start

```bash
# Local Anvil + full infra
./scripts/infra/start-infra.sh local

# Base Sepolia (requires RELAYER_PRIVATE_KEY + NETWORK_PRIVATE_KEY)
RELAYER_PRIVATE_KEY=0x... NETWORK_PRIVATE_KEY=0x... ./scripts/infra/start-infra.sh base-sepolia

# Base mainnet (requires manifest + keys)
RELAYER_PRIVATE_KEY=0x... NETWORK_PRIVATE_KEY=0x... ./scripts/infra/start-infra.sh base
```

## Config files

- `scripts/infra/infra.local.env`
- `scripts/infra/infra.base-sepolia.env`
- `scripts/infra/infra.base.env`

Override `TNT_CORE_DIR` to point at your tnt-core checkout.

## Remote infra (recommended for multi-machine)

If infra runs on separate machines, skip this script and just set the dApp URLs in `apps/tangle-dapp/.env.local`:

```env
VITE_ENVIO_MAINNET_ENDPOINT=https://<your-envio-mainnet>
VITE_ENVIO_TESTNET_ENDPOINT=https://<your-envio-testnet>
VITE_CLAIM_RELAYER_URL=https://<your-relayer>
VITE_SP1_PROVER_API_URL=https://<your-prover-api>
VITE_MIGRATION_RPC_URL=https://<your-rpc>
VITE_TANGLE_MIGRATION_ADDRESS=0x...
```

The dApp will use those remote endpoints directly, no local infra needed.

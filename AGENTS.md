# Tangle dApp monorepo (Nx + Yarn)

## Quick commands
- Install: `yarn install` (Node `>=18.18.x`, Yarn `4.x`)
- Run dApp: `yarn nx serve tangle-dapp` (default `http://localhost:4200`)
- Lint/test/build: `yarn lint`, `yarn test`, `yarn build`

## Env
- Start from `.env.example` (Vite vars are `VITE_*`)
- Set `VITE_GRAPHQL_ENDPOINT` to your Envio/Hasura GraphQL (local indexer or mainnet)
- Optional: `VITE_WALLETCONNECT_PROJECT_ID` for WalletConnect

## Local protocol repo
- `../tnt-core/` (sibling repo): protocol + claims migration contracts, gas relayer, indexer, etc.
- When running locally, ensure:
  - the chain you connect the UI to matches your `tnt-core` deployments
  - `VITE_GRAPHQL_ENDPOINT` points at the indexer for that chain

## Key code locations
- App: `apps/tangle-dapp/` (Vite + React Router)
- Staking (EVM v2):
  - GraphQL hooks: `libs/tangle-shared-ui/src/data/graphql/`
  - Tx hooks: `libs/tangle-shared-ui/src/data/tx/`
  - Write executor: `libs/tangle-shared-ui/src/hooks/useContractWrite.ts`
- Seed scripts (Substrate dev):
  - `yarn script:setupServices` (create blueprints)
  - `yarn script:setupStaking` (LST/vault/operator staking fixtures)
  - `yarn script:setupRestaking` (legacy alias)

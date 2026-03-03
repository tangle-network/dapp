<div align="center">
<a href="https://www.tangle.tools/">

![Tangle Logo](./.github/assets/tangle-banner.png)
</a>
</div>

# Tangle dApp Monorepo

Decentralized interfaces for the [Tangle Operator Layer for AI services](https://tangle.tools), built on the TNT EVM protocol stack from `tnt-core`.

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/tangle-network/dapp/check-build.yml?branch=develop&style=flat-square)](https://github.com/tangle-network/dapp/actions)
[![License Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://www.apache.org/licenses/LICENSE-2.0.html)

## Applications

- [apps/tangle-dapp](./apps/tangle-dapp/README.md): end-user staking, delegation, rewards, and wallet flows.
- [apps/tangle-cloud](./apps/tangle-cloud/README.md): operator/developer workflows for blueprint and service lifecycle management.
- `apps/leaderboard`: operator and protocol analytics.

## Tech Stack

- Monorepo: `Nx`
- Package manager: `Yarn 4` workspaces
- Runtime: `Node.js >= 18.18.x`
- Frontend: `React + Vite`
- Data plane: GraphQL indexer + on-chain reads/writes
- Protocol contracts and indexer source of truth: `../tnt-core`

## Quick Start

1. Install Node 18.18+ and enable Corepack:

```bash
corepack enable
```

2. Install dependencies:

```bash
yarn install
```

3. Set environment variables:

```bash
cp .env.example .env.local
```

Minimum expected values:

- `VITE_GRAPHQL_ENDPOINT` -> Envio/Hasura endpoint for the chain you target.
- `VITE_WALLETCONNECT_PROJECT_ID` (optional) -> WalletConnect support.

4. Run apps:

```bash
yarn nx serve tangle-dapp      # http://localhost:4200
yarn nx serve tangle-cloud     # http://localhost:4201
yarn nx serve leaderboard      # http://localhost:4202
```

## Working With `tnt-core`

This repo is designed to run against a sibling checkout at `../tnt-core`.

When developing locally:

- Ensure the wallet chain matches the chain where `tnt-core` contracts are deployed.
- Ensure `VITE_GRAPHQL_ENDPOINT` points at the matching indexer for that chain.
- Refresh contract metadata/assets when protocol changes land:

```bash
yarn sync:tnt-core-assets
```

Helper scripts:

```bash
yarn infra:local
yarn script:setupServices
yarn script:setupStaking
```

## Quality Gates

```bash
yarn lint
yarn test
yarn build
yarn check:codegen
```

Wallet-flow E2E-style test suite:

```bash
yarn test:wallet-flows
yarn test:wallet-flows:list
```

## Package Manager Policy

Yarn is the canonical package manager for this repository today (`yarn.lock`, Yarn-focused CI, and release workflows). A pnpm migration can be done later as a dedicated infra change, but this branch intentionally keeps one package-manager source of truth to avoid CI/tooling drift.

## Contributing

- Open PRs against `develop` unless release instructions specify otherwise.
- Run `yarn lint`, `yarn test`, and `yarn build` before opening PRs.
- Follow [.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md).

## Help

- Docs: https://docs.tangle.tools/
- Feedback: https://github.com/tangle-network/feedback/discussions/categories/dapp-feedback
- Issues: https://github.com/tangle-network/dapp/issues/new/choose
- Discord: https://discord.gg/jUDeFpggrR

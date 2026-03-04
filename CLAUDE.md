# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Tangle dApp monorepo - a collection of decentralized applications serving as the frontend for the Tangle Network, a Substrate-based cryptocurrency network in the Polkadot ecosystem. Tangle is a layer 1 for on-demand services where developers can build and monetize decentralized services using Tangle Blueprints.

The monorepo uses Nx for fast, extensible building with `apps/` containing interfaces and `libs/` containing shared code.

## Common Development Commands

```bash
# Install dependencies
yarn install

# Development
yarn start                    # Start all apps
yarn start:tangle-dapp       # Start main Tangle dApp
yarn start:tangle-cloud      # Start Tangle Cloud
yarn start:leaderboard       # Start leaderboard app
yarn start:storybook         # Start Storybook for ui-components

# Building
yarn build                   # Build all projects
yarn build:tangle-dapp       # Build specific app
yarn build:tangle-cloud
yarn build:leaderboard

# Code Quality
yarn lint                    # Lint all projects
yarn format                  # Format code with Prettier
yarn format:check            # Check formatting
yarn typecheck               # Type check all projects
yarn pr:check                # Full pre-PR check (format + lint + build)

# Testing
yarn test                    # Run all tests
yarn test <project-name>     # Run tests for specific project

# Release (maintainers only)
yarn generate:release        # Review version bumps and changelog
```

## Architecture & Key Concepts

### Applications (apps/)
- **tangle-dapp**: Main dApp for managing Tangle Network assets and MPC services
- **tangle-cloud**: Cloud interface for Tangle services  
- **leaderboard**: Validator leaderboard application

### Libraries (libs/)
- **abstract-api-provider**: Base classes unifying API across providers
- **api-provider-environment**: React contexts, app events, error handling
- **browser-utils**: Browser utilities (fetch, download, logger, storage)
- **dapp-config**: Chain/wallet configurations for dApps
- **dapp-types**: Shared TypeScript types and interfaces
- **icons**: Shared icon components
- **polkadot-api-provider**: Substrate/Polkadot provider for blockchain interaction
- **solana-api-provider**: Solana blockchain provider
- **tangle-shared-ui**: Tangle-specific logic, hooks, utilities (shared between dApps)
- **ui-components**: Generic reusable UI components
- **web3-api-provider**: EVM provider for blockchain interaction

### Tech Stack
- **Frontend**: Vite, TypeScript, React, TailwindCSS
- **Blockchain**: EVM + PolkadotJS (metadata-driven runtime types)
- **Build System**: Nx monorepo
- **Styling**: TailwindCSS with custom preset

## Development Guidelines

### Execution Posture (Senior IC / Tech Lead)
- Default to ownership and execution. When a goal is clear, proceed immediately without asking permission to continue.
- Prefer decisive action over proposal loops. Bring work to completion end-to-end (implementation, verification, reporting).
- Escalate only for true external blockers (missing credentials, unavailable infrastructure, irreversible risk), and name the exact blocker.
- Report status with concrete evidence (commands run, pass/fail, remaining gaps), not vague progress language.
- For release-readiness tasks, drive to production-grade confidence: strict validation, explicit failure reasons, and concrete remediation steps.
- Avoid “do you want me to…” phrasing when the expected next step is obvious from context.

### Wallet Flow Reliability (agent-browser-driver)
- Treat wallet E2E as environment-first: do not trust flow results until local chain + indexer + dApp are confirmed on the same network.
- Minimum readiness gate before running wallet flows:
  - `http://127.0.0.1:8545` responds to `eth_chainId` with `0x7a69` (31337)
  - Hasura GraphQL endpoint is reachable (typically `http://localhost:8080/v1/graphql`)
  - dApp is started with local indexer env (`VITE_ENVIO_MAINNET_ENDPOINT` and `VITE_ENVIO_TESTNET_ENDPOINT` pointing to local Hasura)
- Use `scripts/local-env/start-local-env.sh` for deterministic local protocol state; if Docker ports are occupied (commonly `5433`), resolve port collisions first or set alternate `ENVIO_PG_PORT` / `HASURA_EXTERNAL_PORT`.
- Wallet preflight failures (`no-provider`, connector timeout, chain mismatch) must be treated as blockers for strict launch validation; only allow non-strict continuation for exploratory debugging.
- A suite result with `turns=0` is not valid evidence of agentic flow execution; treat it as runtime/LLM execution failure and fix provider/runtime conditions first.
- For local wallet runs, prefer persistent seeded profile + automated prompt settling, and ensure funding checks are active for connected local accounts.

### Code Style
- Use `const ... => {}` over `function ... () {}`
- React components: `const Component: FC<Props> = ({ prop1, prop2 }) => { ... }`
- Use `useMemo`/`useCallback` when appropriate (skip for simple calculations)
- Always use braces: `if (condition) { ... }`
- Add empty lines between sibling JSX components
- Avoid comments unless logic is complex
- Use descriptive variable names, avoid acronyms
- Avoid `as` type casting and `any` type

### Folder Structure (within apps)
- `utils/`: Utility functions (one function per file, same filename as function name)
- `components/`: Reusable "dumb" components specific to the app
- `containers/`: "Smart" components with business logic
- `hooks/`: React hooks for infrastructure logic
- `data/`: Data fetching hooks organized by domain (staking, liquid staking, etc.)
- `pages/`: Route pages for react-router-dom
- `abi/`: EVM ABI definitions for Substrate precompiles

### Important Notes
- **Localize changes**: Keep changes isolated to relevant projects unless shared libraries are involved
- **Package dependencies**: Don't assume packages exist - check imports or root `package.json` first
- **Number handling**: For values > u32 from chain, use `BN` or `bigint`. For u32 or smaller, use `.toNumber()`
- **Monorepo scope**: Avoid cross-project changes unless working with shared libs
- **Storybook**: Considered legacy, avoid creating/modifying storybook files
- **Testing**: No testing libraries currently used or planned

### Branch Strategy
- Main development branch: `develop`
- Main branch for releases: `master`
- Release PRs should start with `[RELEASE]` in title

### Prerequisites
- Node.js v18.18.x or later
- Yarn package manager (v4.7.0)

## Working with Specific Libraries

### tangle-shared-ui
Contains Tangle-specific logic shared between dApps. Use this for functionality tied to Tangle Network context.

### ui-components
Generic, reusable components not tied to any specific context. Should be usable across different dApps.

### API Providers
- Use `polkadot-api-provider` for Substrate/Polkadot interactions
- Use `web3-api-provider` for EVM interactions
- Use `abstract-api-provider` base classes when creating new providers

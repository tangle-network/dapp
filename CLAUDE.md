# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Tangle dApp monorepo - a collection of decentralized applications for the Tangle Operator Layer for AI services, built on the TNT EVM protocol stack (`tnt-core`).

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

- **tangle-dapp**: Main dApp for staking, delegation, rewards, migration claims, and wallet flows
- **tangle-cloud**: Operator/developer interface for blueprint and service lifecycle management
- **leaderboard**: Points and participation leaderboard

### Libraries (libs/)

- **abstract-api-provider**: Base classes unifying API across providers
- **api-provider-environment**: React contexts, app events, error handling
- **browser-utils**: Browser utilities (fetch, download, logger, storage)
- **dapp-config**: Chain/wallet configurations for dApps
- **dapp-types**: Shared TypeScript types and interfaces
- **icons**: Shared icon components
- **polkadot-api-provider**: Legacy chain provider used only by migration-claim flows
- **solana-api-provider**: Solana blockchain provider
- **tangle-shared-ui**: Tangle-specific logic, hooks, utilities (shared between dApps)
- **ui-components**: Generic reusable UI components
- **web3-api-provider**: EVM provider for blockchain interaction

### Tech Stack

- **Frontend**: Vite, TypeScript, React, TailwindCSS
- **Blockchain**: EVM-first (`viem`/`wagmi`) with limited PolkadotJS usage for migration-claim interoperability
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
- For launch-flow-impacting changes, follow `docs/harness-engineering-spec.md` and complete `docs/harness-engineering-checklist.md` before requesting merge.

### Harness Release Process (Succinct)

- Scope launch-impacting work to explicit flow IDs in `docs/launch-readiness-board.csv`.
- Run harness suite: `yarn test:wallet-flows` and inspect `suite/report.json` + `suite/release-matrix.md`.
- Enforce gate: `yarn test:wallet-flows:gate` (or `:strict` when required).
- Critical flows (`FLOW-001,002,005,010,011,013,014,018,019`) must be `happy-path-pass` unless exception owner/ETA is documented.
- Include matrix summary and gate output in PR using the harness section in `.github/PULL_REQUEST_TEMPLATE.md`.

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
- `abi/`: EVM ABI definitions for precompiles/contracts

### Important Notes

- **Localize changes**: Keep changes isolated to relevant projects unless shared libraries are involved
- **Package dependencies**: Don't assume packages exist - check imports or root `package.json` first
- **Number handling**: Prefer `bigint`/`viem` primitives for chain values; avoid introducing new `BN` usage.
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

- Use `polkadot-api-provider` only where migration-claim compatibility requires it
- Use `web3-api-provider` for EVM interactions
- Use `abstract-api-provider` base classes when creating new providers

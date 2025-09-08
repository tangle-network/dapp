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
- **Blockchain**: PolkadotJS with auto-generated types (`@tangle-network/tangle-substrate-types`)
- **Build System**: Nx monorepo
- **Styling**: TailwindCSS with custom preset

## Development Guidelines

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
- `data/`: Data fetching hooks organized by domain (restaking, liquid staking, etc.)
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

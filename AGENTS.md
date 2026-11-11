# Tangle dApp

This Nx workspace contains Tangle applications and shared libraries for the TNT EVM protocol stack.
Shared repository guidance lives here; `CLAUDE.md` imports this file.

## Find the owning source

Use root `package.json`, project configuration, and Nx targets for current setup, commands, runtime, and test tools.
Read the relevant application's source and shared library before adding a parallel implementation.
Keep application-specific changes local; put reusable Tangle behavior in `tangle-shared-ui` and generic components in `ui-components`.

Start environment configuration from [.env.example](.env.example).
For local protocol setup, read [scripts/local-env/start-local-env.sh](scripts/local-env/start-local-env.sh) and the matching `tnt-core` checkout.
The dApp, indexer, wallet, and deployed contracts must use the same chain.
Check current deployment configuration and live endpoints before relying on a remembered host, port, or chain identifier.

Use `bigint` and `viem` for chain values rather than introducing new `BN` usage.
Use the EVM provider for EVM interactions; retain Polkadot compatibility where migration claims require it.
Verify migration proof, RPC, contract, and optional relayer configuration against the selected chain before exercising a claim.

## Wallet and launch verification

For launch-impacting changes, read [harness-engineering-spec.md](docs/harness-engineering-spec.md) and complete the applicable [checklist](docs/harness-engineering-checklist.md).
Use [wallet-flow-suite.md](docs/wallet-flow-suite.md) for execution and the [launch readiness board](docs/launch-readiness-board.csv) for flow coverage.
Run the applicable wallet suite and release check from package scripts, then inspect its report and release matrix.
Include the requested verification results in the PR's existing template.
Required flows and exceptions belong in those maintained records, not a second list here.

Verify the chain, indexer, dApp, wallet provider, and funded test account before interpreting wallet-flow results.
Resolve local port conflicts through supported environment configuration.
Provider absence, connector timeouts, or chain mismatches block strict launch validation.
Exploratory continuation must remain identified as exploratory.
A result with zero agent turns does not prove the agent executed the flow; fix the runtime or model failure first.
Preserve the wallet suite's seeded profile, prompt handling, and funding checks.

## Code conventions

Follow the repository's configured formatting, lint, type, test, and build targets.
Use arrow functions, braces for control flow, descriptive names, and typed component props.
Avoid `any` and unnecessary type assertions.
Use memoization only when the component's behavior warrants it.
Keep business logic, data hooks, and generic UI responsibilities distinct without splitting code solely to meet a file quota.
Treat existing Storybook surfaces as legacy; do not add or modify them for ordinary application work.

## Branches and release

Feature, fix, and chore PRs target `develop`.
Production uses `master`; read [auto-sync-master-with-develop.yml](.github/workflows/auto-sync-master-with-develop.yml) and the release workflows before a release.
The automation promotes a develop push containing a `[RELEASE]` marker in a commit message.
Use that marker only for an intended release; ordinary maintenance must not trigger promotion.
Follow the workflow's current merge behavior rather than assuming it is a fast-forward.
Use deployment configuration and the live release result to determine which applications were published.

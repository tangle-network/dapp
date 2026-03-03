# Wallet Flow Suite (Launch Manual Sign-Off)

Last updated: 2026-03-03

## Purpose
This suite provides executable browser-agent coverage for every `ready-manual-signoff` launch flow in `docs/launch-readiness-board.csv`.

- Runner: `scripts/agent-browser/run-wallet-flow-suite.mjs`
- Case catalog: `scripts/agent-browser/cases/launch-ready-manual-signoff.cases.mjs`
- Config: `agent-browser-driver.config.mjs`

The runner validates case coverage against `docs/launch-readiness-board.csv` and fails fast if any launch flow is missing.

## Prerequisites
1. Start both apps:
   - `yarn nx serve tangle-dapp` (`http://localhost:4200`)
   - `yarn nx serve tangle-cloud` (`http://localhost:4300`)
2. Ensure GraphQL/indexer endpoints are configured and in sync with your chain.
3. Ensure wallet extension is available and unlocked in the persistent profile.
4. Provide an LLM key (`OPENAI_API_KEY` or equivalent supported by `agent-browser-driver`).

Optional wallet env vars:
- `AGENT_WALLET_EXTENSION_PATHS=/abs/path/to/metamask,/abs/path/to/rabby`
- `AGENT_WALLET_USER_DATA_DIR=/abs/path/to/.agent-wallet-profile`

## Commands
- List all covered launch flows:
  - `yarn test:wallet-flows:list`
- Run all launch flows:
  - `yarn test:wallet-flows`
- Run all launch flows in Docker + Xvfb (recommended on Linux hosts without a desktop session):
  - `yarn test:wallet-flows:docker`
- Run one flow:
  - `yarn test:wallet-flows --flow FLOW-001`
- Run by persona:
  - `yarn test:wallet-flows --persona user`
- Run service/blueprint-id-dependent flows with explicit ids:
  - `yarn test:wallet-flows --blueprint-id 1 --service-id 1`
- Override LLM runtime directly from CLI:
  - `yarn test:wallet-flows --provider openai --model gpt-4o --api-key $OPENAI_API_KEY`
  - `yarn test:wallet-flows --base-url http://localhost:4000/v1 --api-key local-dev-key`

## Covered Launch Flows
| Flow ID | Persona | Flow | Start Surface |
|---|---|---|---|
| FLOW-001 | user | staking deposit | `/staking/deposit` |
| FLOW-002 | user | staking delegate | `/staking/delegate` |
| FLOW-003 | user | staking undelegate | `/staking/undelegate` |
| FLOW-004 | user | staking withdraw | `/staking/withdraw` |
| FLOW-005 | user | staking rewards claim | `/staking/rewards` |
| FLOW-006 | user | staking route surface | `/staking/deposit` + native-route negative check |
| FLOW-007 | user | migration claim submission | `/claim/migration` |
| FLOW-009 | customer | blueprint discovery/details | `/blueprints` |
| FLOW-010 | customer | deploy blueprint request | `/blueprints/:id/deploy` (or `/blueprints` fallback) |
| FLOW-011 | customer | service ACL/funding/job | `/services/:id` (or `/instances` fallback) |
| FLOW-012 | customer | cloud tx history/notifier | `/instances` |
| FLOW-013 | operator | pending request approve/reject | `/instances` |
| FLOW-014 | operator | join/leave/exit lifecycle | `/services/:id` (or `/instances` fallback) |
| FLOW-015 | operator | operators page stake deep-link | `/operators` |
| FLOW-016 | operator | operator tx lifecycle traceability | `/instances` |
| FLOW-017 | operator | security requirements read resilience | `/services/:id` (or `/instances` fallback) |
| FLOW-018 | developer | blueprint registration/create/manage | `/blueprints` + `/blueprints/create` + `/blueprints/manage` |
| FLOW-019 | developer | operator batch register hook | `/blueprints` |

## Artifacts and Exit Criteria
- Artifacts are written to `agent-results/wallet-flows/` by default.
- Runner exits non-zero when any case fails or is skipped.
- Use generated report artifacts plus tx hashes/request ids as launch sign-off evidence.

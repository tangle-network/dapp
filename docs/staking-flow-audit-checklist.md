# Staking Flow Audit Checklist (dApp + Cloud)

Last updated: 2026-03-03

## Scope
- Repos reviewed:
  - `/home/drew/code/dapp`
- Apps covered:
  - `apps/tangle-dapp`
  - `apps/tangle-cloud`
- Personas covered:
  - Users/customers
  - Operators
  - Developers/builders

## Detailed User Story Catalog
- Story-level validation catalog: [user-stories-validation-catalog.md](./user-stories-validation-catalog.md)
- Machine-readable export: [user-stories-validation-catalog.csv](./user-stories-validation-catalog.csv)
- Flow-level validation summary: [flow-validation-report.md](./flow-validation-report.md)

## Strict Status Keys
- `Implemented (verified)`: Deterministic automated coverage validates critical acceptance behavior.
- `Implemented (manual-required)`: Implemented in code but still needs manual wallet/browser/live-network validation.
- `Partial`: Implementation or validation coverage is incomplete for release confidence.
- `Missing`: Not implemented.

## End-to-End Flow Checklist

| Persona | Flow | Route | Validation Coverage | Strict Status |
|---|---|---|---|---|
| User | Staking deposit | `/staking/deposit` | Lint/typecheck/test/build + manual wallet E2E | Implemented (manual-required) |
| User | Staking delegate | `/staking/delegate` | Lint/typecheck/test/build + manual wallet E2E | Implemented (manual-required) |
| User | Staking undelegate (schedule/execute) | `/staking/undelegate` | Lint/typecheck/test/build + manual wallet E2E | Implemented (manual-required) |
| User | Staking withdraw (schedule/execute) | `/staking/withdraw` | Lint/typecheck/test/build + manual wallet E2E | Implemented (manual-required) |
| User | Staking rewards claim | `/staking/rewards` | Lint/typecheck/test/build + manual wallet E2E | Implemented (manual-required) |
| User | Staking route surface | `/staking/*` | Static route verification | Implemented (manual-required) |
| User | Migration claim | `/claim/migration` | Hook/unit coverage + manual-required runtime verification | Partial |
| User | Native staking lifecycle | `/native-staking` | Static + manual-required | Partial (deprioritized non-launch) |
| Customer | Blueprint discovery/details | `/blueprints`, `/blueprints/:id` | Lint/typecheck/build + static review | Implemented (manual-required) |
| Customer | Deploy blueprint request | `/blueprints/:id/deploy` | Typecheck + targeted request-schema test + manual E2E | Implemented (manual-required) |
| Customer | Service ACL/funding/job flow | `/services/:id` | Lint/typecheck/test/build + manual E2E | Implemented (manual-required) |
| Customer | Cloud tx history/notifier | Global cloud layout/header | Component wiring + cloud tests + manual-required UX validation | Implemented (manual-required) |
| Operator | Pending request approve/reject | `/instances` | Lint/typecheck + static review + manual E2E | Implemented (manual-required) |
| Operator | Join/leave/exit lifecycle | `/services/:id` | Lint/typecheck + static review + manual E2E | Implemented (manual-required) |
| Operator | Operators page stake deep-link | `/operators` -> dApp delegate | Static route/query verification + automated unit tests + manual-required runtime validation | Implemented (manual-required) |
| Operator | Operator tx lifecycle traceability | Cloud tx lifecycle states | Static review + notifier tests + manual-required runtime verification | Implemented (manual-required) |
| Operator | Security requirement read resilience | Contract read path | Fail-closed hook + explicit UI errors + manual runtime validation | Implemented (manual-required) |
| Developer | Registration drawer | `/blueprints` | Typecheck/lint + static review | Implemented (manual-required) |
| Developer | Create/manage blueprint routes | `/blueprints/create`, `/blueprints/manage` | Route wiring + typecheck | Implemented (manual-required) |
| Developer | Operator batch register hook | Cloud tx hook | Typecheck + code-path validation | Implemented (manual-required) |

## Strict Completeness Answer
- **Are all user flows complete?** **No.**
- Current blockers are migration claim partiality, native staking lifecycle deprioritization, and lack of automated wallet/browser E2E certification for critical write paths.

## Terminology Migration Status (Legacy Naming -> `staking`)

### Current state
- Canonical dApp routes are `/staking/*` and `/native-staking`.
- Native restaking route aliases are removed from canonical UI routing.
- Native restaking contract/user-flow certification is explicitly out of launch scope.
- Shared wrappers (`useStakingAssets`, `StakingContext`, `data/staking/*`) coexist with compatibility aliases where needed.
- Operator indexer responses still expose protocol `restaking*` fields in parse boundaries for compatibility.

### Current residuals (unavoidable protocol surfaces)
- `restaking*` operator fields remain at GraphQL parse boundaries only:
  - `libs/tangle-shared-ui/src/data/graphql/useOperators.ts`
  - `libs/tangle-shared-ui/src/data/graphql/useBlueprints.ts`

## Verification Evidence (Executed In This Pass)

| Command | Result |
|---|---|
| `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | Success |
| `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | Success |
| `rg -n "/native-staking|PagePath\\.NATIVE_STAKING" apps/tangle-dapp/src/app/app.tsx apps/tangle-dapp/src/types/index.ts` | Confirms canonical native staking route surface |
| `rg -n "TxHistoryDrawer|TxHistoryNotifier|TxConfirmationModal" apps/tangle-cloud/src/components apps/tangle-cloud/src -g'*.ts' -g'*.tsx'` | Confirms cloud tx timeline wiring |
| `rg -n --no-heading "\.restaking(Status|Stake|DelegationCount|LeavingRound|ScheduledUnstakeAmount|ScheduledUnstakeRound)" apps libs -g'*.ts' -g'*.tsx'` | Confirms `restaking*` matches are in GraphQL parse boundaries |
| `rg -n "getServiceRequestSecurityRequirements|getServiceSecurityRequirements|Unable to load security requirements" apps/tangle-cloud/src/data/services apps/tangle-cloud/src/pages -g'*.ts' -g'*.tsx'` | Confirms fail-closed contract read path and explicit UI error messaging |
| `rg --files | rg -i '(playwright|cypress|e2e|\.feature$)'` | No dedicated browser E2E harness found |

## Open Gaps
- Migration claim still requires live wallet+relayer reliability validation.
- Native staking pod lifecycle is deprioritized for launch and not release-certified.
- Native restaking contract/user-flow coverage is intentionally excluded from launch certification.
- Wallet-connected approve/join/leave/terminate journeys still require manual cross-chain runtime validation.
- Current automated tests (7 files) do not provide broad end-to-end flow certification for the 300-story catalog.

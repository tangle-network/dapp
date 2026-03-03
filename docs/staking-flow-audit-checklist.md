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
- Launch gate board: [launch-readiness-board.md](./launch-readiness-board.md)
- Launch gate board (CSV): [launch-readiness-board.csv](./launch-readiness-board.csv)
- Wallet/browser launch suite: [wallet-flow-suite.md](./wallet-flow-suite.md)
- Backlog closeout triage: [../LAUNCH_BACKLOG_CLOSEOUT.md](../LAUNCH_BACKLOG_CLOSEOUT.md)

## Strict Status Keys
- `Implemented (verified)`: Deterministic automated coverage validates critical acceptance behavior.
- `Implemented (manual-required)`: Implemented in code but still needs manual wallet/browser/live-network validation.
- `Partial`: Implementation or validation coverage is incomplete for release confidence.
- `Missing`: Not implemented.

## Launch Gate Keys
- `ready-manual-signoff`: Flow is implemented, but release sign-off still requires manual runtime validation.
- `ready-verified`: Flow is implemented and release-certified by deterministic automated validation.
- `blocked-partial`: Flow cannot be release-certified because implementation/validation is partial.
- `removed-non-launch`: Flow is intentionally excluded from this launch scope.

## End-to-End Flow Checklist

| Persona | Flow | Route/Surface | Owner | Gate Criteria | Verification Command | Gate Status | Strict Status |
|---|---|---|---|---|---|---|---|
| User | Staking deposit | `/staking/deposit` | dapp-frontend | Deposit tx succeeds and post-tx balances refresh | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| User | Staking delegate | `/staking/delegate` | dapp-frontend | Delegate tx succeeds and delegation state updates | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| User | Staking undelegate (schedule/execute) | `/staking/undelegate` | dapp-frontend | Schedule and execute paths respect round semantics | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| User | Staking withdraw (schedule/execute) | `/staking/withdraw` | dapp-frontend | Schedule and execute withdraw states remain consistent | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| User | Staking rewards claim | `/staking/rewards` | dapp-frontend | Rewards claim tx and UI totals remain consistent | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| User | Staking route surface | `/staking/*` | dapp-frontend | Canonical staking routes are present; native staking hidden from launch nav | `rg -n "/native-staking|PagePath\\.NATIVE_STAKING" apps/tangle-dapp/src/app/app.tsx apps/tangle-dapp/src/components/Sidebar/sidebarProps.tsx apps/tangle-dapp/src/types/index.ts` | ready-manual-signoff | Implemented (manual-required) |
| User | Migration claim | `/claim/migration` | migration+tnt-core | Live wallet + relayer + runtime claim path proves reliable | `yarn nx serve tangle-dapp` | ready-manual-signoff | Implemented (manual-required) |
| User | Native staking lifecycle | Hidden from launch UI | protocol/product | Native staking pod lifecycle launch certification | `rg -n "/native-staking|PagePath\\.NATIVE_STAKING" apps/tangle-dapp/src/app/app.tsx apps/tangle-dapp/src/components/Sidebar/sidebarProps.tsx apps/tangle-dapp/src/types/index.ts` | removed-non-launch | Partial (deprioritized non-launch) |
| Customer | Blueprint discovery/details | `/blueprints`, `/blueprints/:id` | cloud-frontend | Blueprint list/detail render with stable loading/error handling | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| Customer | Deploy blueprint request | `/blueprints/:id/deploy` | cloud-frontend | Request payload encodes and submits against schema rules | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| Customer | Service ACL/funding/job flow | `/services/:id` | cloud-frontend | Join/fund/submit lifecycle preserves tx and status integrity | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| Customer | Cloud tx history/notifier | Global cloud layout/header | cloud-frontend | Drawer/notifier/modal states stay consistent for tx lifecycle | `rg -n "TxHistoryDrawer|TxHistoryNotifier|TxConfirmationModal" apps/tangle-cloud/src/components apps/tangle-cloud/src -g'*.ts' -g'*.tsx'` | ready-manual-signoff | Implemented (manual-required) |
| Operator | Pending request approve/reject | `/instances` | cloud-frontend | Approve/reject actions preserve queue and tx state consistency | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| Operator | Join/leave/exit lifecycle | `/services/:id` | cloud-frontend | Join/leave/terminate paths complete without stale state | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| Operator | Operators page stake deep-link | `/operators` -> dApp delegate | cloud-frontend + dapp-frontend | Stake CTA deep-links with correct route/query context | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| Operator | Operator tx lifecycle traceability | Cloud tx lifecycle states | cloud-frontend | In-progress/success/error states match notifier and history | `rg -n "TxHistoryDrawer|TxHistoryNotifier|TxConfirmationModal" apps/tangle-cloud/src/components apps/tangle-cloud/src -g'*.ts' -g'*.tsx'` | ready-manual-signoff | Implemented (manual-required) |
| Operator | Security requirement read resilience | Contract read path | cloud-frontend | Fail-closed read behavior with explicit UI errors | `rg -n "getServiceRequestSecurityRequirements|getServiceSecurityRequirements|Unable to load security requirements" apps/tangle-cloud/src/data/services apps/tangle-cloud/src/pages -g'*.ts' -g'*.tsx'` | ready-manual-signoff | Implemented (manual-required) |
| Developer | Blueprint registration/create/manage routes | `/blueprints`, `/blueprints/create`, `/blueprints/manage` | cloud-frontend | Registration/create/manage paths stay type-safe, wired, and traceable | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |
| Developer | Operator batch register hook | Cloud tx hook | cloud-frontend + shared-ui | Hook path preserves tx submit/result handling | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | ready-manual-signoff | Implemented (manual-required) |

## Governance Usage
- Use this checklist for meeting-time walkthrough and evidence capture only.
- Final gate status and go/no-go decisions must come from [launch-readiness-board.md](./launch-readiness-board.md).
- For every `ready-manual-signoff` row, capture manual sign-off evidence (env, wallet, tx hash/request id, pass/fail, approver, date).

## Strict Completeness Answer
- **Are all user flows complete?** **No.**
- Current blockers are native staking lifecycle non-launch scope and lack of automated wallet/browser E2E certification for critical write paths.

## Terminology Status (Staking-Canonical)

### Current state
- Canonical dApp launch routes are `/staking/*`; native staking is removed from launch navigation/routing.
- Legacy native staking route aliases are removed from canonical UI routing.
- Native staking contract/user-flow certification is explicitly out of launch scope.
- Shared APIs use staking-first names (`useStakingAssets`, `StakingContext`, `data/staking/*`).
- Internal legacy parse-boundary fields were removed from dApp/cloud runtime code.

### Current residuals (unavoidable protocol surfaces)
- Remaining non-staking terms are external protocol/provider names only:
  - Native staking ABI/runtime fields in `apps/tangle-dapp/src/abi/validatorPod.ts` and `apps/tangle-dapp/src/features/native-staking/hooks/useValidatorPod.ts`
  - Inflation pool ABI fields in `libs/tangle-shared-ui/src/abi/inflationPool.ts`
  - External provider token identifiers (for example `renzo-restaked-eth`) in token-price/bridge metadata

## Verification Evidence (Executed In This Pass)

| Command | Result |
|---|---|
| `rg -n "/native-staking|PagePath\\.NATIVE_STAKING" apps/tangle-dapp/src/app/app.tsx apps/tangle-dapp/src/components/Sidebar/sidebarProps.tsx apps/tangle-dapp/src/types/index.ts` | No matches (native staking is hidden from launch UI) |
| `rg -n "TxHistoryDrawer|TxHistoryNotifier|TxConfirmationModal" apps/tangle-cloud/src/components apps/tangle-cloud/src -g'*.ts' -g'*.tsx'` | Confirms cloud tx timeline wiring |
| `rg -n "getServiceRequestSecurityRequirements|getServiceSecurityRequirements|Unable to load security requirements" apps/tangle-cloud/src/data/services apps/tangle-cloud/src/pages -g'*.ts' -g'*.tsx'` | Confirms fail-closed contract read path and explicit UI error messaging |
| `yarn test:wallet-flows:list` | Confirms wallet-flow suite coverage for all launch `ready-manual-signoff` gates |
| `wc -l docs/user-stories-validation-catalog.csv docs/launch-readiness-board.csv` | Confirms story catalog row count (`301`) and launch board row count (`20` incl. header) |
| `rg -n ',ready-manual-signoff$' docs/launch-readiness-board.csv \| wc -l` | 18 |
| `rg -n ',blocked-partial$' docs/launch-readiness-board.csv \| wc -l` | 0 |
| `rg -n ',removed-non-launch$' docs/launch-readiness-board.csv \| wc -l` | 1 |

## Open Gaps
- Migration claim now uses fail-closed config checks and relayer receipt confirmation, but still requires manual live wallet/relayer sign-off.
- Native staking pod lifecycle remains non-launch scope and is not release-certified (removed from launch-action backlog).
- Native staking contract/user-flow coverage is intentionally excluded from launch certification (removed from launch-action backlog).
- Wallet-connected approve/join/leave/terminate journeys still require manual cross-chain runtime validation.
- Wallet browser-agent suite is available (`yarn test:wallet-flows`), but deterministic CI certification is still limited because these flows depend on live wallet + chain + indexer state.

# Launch Readiness Board (Flow Gates)

Generated: 2026-03-03

## Gate Status Keys
- `ready-manual-signoff`: Implemented in code, but release gate still requires manual wallet/browser/live-network sign-off.
- `ready-verified`: Implemented and covered by deterministic automated validation for critical acceptance behavior.
- `blocked-partial`: Flow implementation or validation remains partial.
- `removed-non-launch`: Explicitly out of launch scope; not a release gate for this launch.

## Board

| flow_id | persona | flow | route_or_surface | gate_criteria | owner | verification_command | strict_status | gate_status |
|---|---|---|---|---|---|---|---|---|
| FLOW-001 | user | staking deposit | `/staking/deposit` | Submit deposit tx and confirm post-tx state refresh | dapp-frontend | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-002 | user | staking delegate | `/staking/delegate` | Submit delegate tx and confirm operator/delegation state updates | dapp-frontend | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-003 | user | staking undelegate | `/staking/undelegate` | Schedule and execute undelegation with correct round handling | dapp-frontend | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-004 | user | staking withdraw | `/staking/withdraw` | Schedule and execute withdraw with receipt/state parity | dapp-frontend | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-005 | user | staking rewards claim | `/staking/rewards` | Claim rewards and verify balance/state updates in UI | dapp-frontend | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-006 | user | staking route surface | `/staking/*` | Canonical staking routes exposed; native staking route hidden from launch UI | dapp-frontend | `rg -n "/native-staking|PagePath\\.NATIVE_STAKING" apps/tangle-dapp/src/app/app.tsx apps/tangle-dapp/src/components/Sidebar/sidebarProps.tsx apps/tangle-dapp/src/types/index.ts` | implemented+manual-required | ready-manual-signoff |
| FLOW-007 | user | migration claim submission | `/claim/migration` | Wallet + relayer + runtime claim path succeeds end to end | migration+tnt-core | `yarn nx serve tangle-dapp` | implemented+manual-required | ready-manual-signoff |
| FLOW-008 | user | native staking pod lifecycle | hidden from launch UI | Native staking pod lifecycle certification for launch | protocol/product | `rg -n "/native-staking|PagePath\\.NATIVE_STAKING" apps/tangle-dapp/src/app/app.tsx apps/tangle-dapp/src/components/Sidebar/sidebarProps.tsx apps/tangle-dapp/src/types/index.ts` | partial | removed-non-launch |
| FLOW-009 | customer | blueprint discovery/details | `/blueprints`, `/blueprints/:id` | Query/render blueprint list and details with stable loading/error handling | cloud-frontend | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-010 | customer | deploy blueprint request | `/blueprints/:id/deploy` | Encode schema-conformant request payload and submit successfully | cloud-frontend | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-011 | customer | service ACL/funding/job | `/services/:id` | Join/fund/submit lifecycle preserves tx + status integrity | cloud-frontend | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-012 | customer | cloud tx history/notifier | cloud layout/header | Drawer/notifier/modal show consistent tx lifecycle states | cloud-frontend | `rg -n "TxHistoryDrawer|TxHistoryNotifier|TxConfirmationModal" apps/tangle-cloud/src/components apps/tangle-cloud/src -g'*.ts' -g'*.tsx'` | implemented+manual-required | ready-manual-signoff |
| FLOW-013 | operator | pending request approve/reject | `/instances` | Approve/reject flows emit trackable tx states and preserve list consistency | cloud-frontend | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-014 | operator | join/leave/exit lifecycle | `/services/:id` | Join/leave/terminate operator lifecycle paths complete without stale state | cloud-frontend | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-015 | operator | operators page stake deep-link | `/operators` | Stake CTA deep-links with correct route/query context | cloud-frontend + dapp-frontend | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-016 | operator | operator tx lifecycle traceability | cloud tx lifecycle | In-progress/success/error states remain consistent across notifier and history | cloud-frontend | `rg -n "TxHistoryDrawer|TxHistoryNotifier|TxConfirmationModal" apps/tangle-cloud/src/components apps/tangle-cloud/src -g'*.ts' -g'*.tsx'` | implemented+manual-required | ready-manual-signoff |
| FLOW-017 | operator | security requirements read resilience | service request modal paths | Fail-closed read behavior and explicit error messaging | cloud-frontend | `rg -n "getServiceRequestSecurityRequirements|getServiceSecurityRequirements|Unable to load security requirements" apps/tangle-cloud/src/data/services apps/tangle-cloud/src/pages -g'*.ts' -g'*.tsx'` | implemented+manual-required | ready-manual-signoff |
| FLOW-018 | developer | blueprint registration/create/manage | `/blueprints*` | Registration drawer/create/manage routes remain schema and type-safe | cloud-frontend | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |
| FLOW-019 | developer | operator batch register hook | cloud tx hook | Hook path compiles and preserves tx submission/result handling | cloud-frontend + shared-ui | `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | implemented+manual-required | ready-manual-signoff |

## Summary
- `ready-manual-signoff`: 18
- `blocked-partial`: 0
- `removed-non-launch`: 1
- `ready-verified`: 0

Canonical machine-readable export: [launch-readiness-board.csv](./launch-readiness-board.csv)

Wallet/browser sign-off suite (covers all `ready-manual-signoff` rows): `yarn test:wallet-flows`

## Governance Use (Go/No-Go)
- Treat this board as the flow-level release gate source of truth for launch decisions.
- Go condition for this launch: `blocked-partial=0` and all `ready-manual-signoff` rows have recorded manual sign-off evidence.
- `removed-non-launch` rows must remain explicitly excluded in product scope approval; they are not blockers.
- Sign-off evidence should include chain/environment, wallet type, tx hash/request id, pass/fail outcome, date, and approver.

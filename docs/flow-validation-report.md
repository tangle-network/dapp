# Flow Validation Report (Complement to 300-Story Catalog)

Generated: 2026-03-03

## Purpose and Scope
This report complements [user-stories-validation-catalog.md](./user-stories-validation-catalog.md) by summarizing multi-persona flow status using strict implementation labels and evidence re-validated in this pass.

Primary references:
- [user-stories-validation-catalog.md](./user-stories-validation-catalog.md)
- [user-stories-validation-catalog.csv](./user-stories-validation-catalog.csv)
- [staking-flow-audit-checklist.md](./staking-flow-audit-checklist.md)

## Strict Status Taxonomy
- **Implemented (verified)**: Fully covered by deterministic automated verification for critical acceptance behavior.
- **Implemented (manual-required)**: Implemented in code, but release confidence still depends on wallet/browser/live-network/manual checks.
- **Partial**: Implemented in part only, or blocked by known validation/coverage gaps.
- **Missing**: Not implemented.

## Catalog Snapshot (Strict)
- Total stories: 300
- Persona distribution: user=75, customer=75, operator=75, developer=75
- Story status distribution: implemented+verified=0, implemented+manual-required=290, partial=10, missing=0
- Flow status distribution (60 flows): implemented+verified=0, implemented+manual-required=58, partial=2, missing=0
- Confidence distribution (legacy score): High=139, Medium=155, Low=6
- Stories with manual-path evidence tags (`[MANUAL_UI_E2E]` or `[MANUAL_NEGATIVE]` or `[MANUAL_REQUIRED]`): 246

## Completeness Verdict
- **Are all user flows complete?** **No.**
- Strictly, no major flow currently meets implemented+verified criteria.

## Persona Flow Matrix (Strict)

| Persona | Major Flow | Strict Status | Confidence | Coverage Type |
|---|---|---|---|---|
| User | EVM staking lifecycle (`/staking/deposit|delegate|undelegate|withdraw|rewards`) | Implemented (manual-required) | Medium | Automated + manual E2E required |
| User | Staking route canonicalization (`/staking*`) | Implemented (manual-required) | High | Automated + static route inspection |
| User | Migration claim (`/claim/migration`) | Partial | Low | Hook/unit coverage + live wallet/relayer runtime validation pending |
| User | Native staking lifecycle | Partial (deprioritized non-launch) | Low | Hidden from launch UI; not release-certified |
| Customer | Blueprint discovery/details/deploy request flow | Implemented (manual-required) | Medium | Automated + manual E2E required |
| Customer | Service ACL/funding/job flow (`/services/:id`) | Implemented (manual-required) | Medium | Automated + manual E2E required |
| Customer | Cloud tx history/notifier parity | Implemented (manual-required) | Medium | Static + automated tests + manual E2E required |
| Operator | Pending request approve/reject (`/instances`) | Implemented (manual-required) | Medium | Automated + manual E2E required |
| Operator | Join/leave/exit lifecycle (`/services/:id`) | Implemented (manual-required) | Medium | Automated + manual E2E required |
| Operator | Operators page stake deep-link | Implemented (manual-required) | Medium | Static route/query verification + automated tests + manual E2E required |
| Operator | Operator tx lifecycle traceability | Implemented (manual-required) | Medium | Static + automated tests + manual E2E required |
| Operator | Security requirements read resilience | Implemented (manual-required) | Medium | Static verification + manual-required runtime validation |
| Developer | Blueprint registration drawer | Implemented (manual-required) | Medium | Automated + manual tx verification |
| Developer | Deploy request schema-aware encoding path | Implemented (manual-required) | Medium | Automated unit test + typecheck |
| Developer | Blueprint create/manage routes | Implemented (manual-required) | High | Automated + route wiring verified |
| Developer | Operator batch register hook | Implemented (manual-required) | Medium | Static + typecheck; manual tx confirmation pending |

## Evidence Map (Code + Commands)

| Flow | Code Evidence | Validation Command(s) |
|---|---|---|
| EVM staking lifecycle | `apps/tangle-dapp/src/app/app.tsx`; `apps/tangle-dapp/src/pages/staking/*`; `libs/tangle-shared-ui/src/data/tx/*` | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` |
| Native staking launch exposure (removed) | `apps/tangle-dapp/src/app/app.tsx`; `apps/tangle-dapp/src/components/Sidebar/sidebarProps.tsx`; `apps/tangle-dapp/src/types/index.ts` | `rg -n "/native-staking|PagePath\\.NATIVE_STAKING" apps/tangle-dapp/src/app/app.tsx apps/tangle-dapp/src/components/Sidebar/sidebarProps.tsx apps/tangle-dapp/src/types/index.ts` |
| Cloud tx history/notifier parity | `apps/tangle-cloud/src/components/TxHistoryDrawer.tsx`; `apps/tangle-cloud/src/components/TxHistoryNotifier.tsx`; `apps/tangle-cloud/src/components/Layout.tsx`; `apps/tangle-cloud/src/components/Header.tsx` | `rg -n "TxHistoryDrawer|TxHistoryNotifier|TxConfirmationModal" apps/tangle-cloud/src/components apps/tangle-cloud/src -g'*.ts' -g'*.tsx'`; `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` |
| Deploy request schema-aware encoding | `apps/tangle-cloud/src/pages/blueprints/[id]/deploy/page.tsx`; `apps/tangle-cloud/src/data/services/useBlueprintRequestSchema.ts`; `libs/tangle-shared-ui/src/data/graphql/encodeServiceConfig.ts` | `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache`; `yarn nx run tangle-cloud:typecheck --skip-nx-cache` |
| Security requirements fail-closed path | `apps/tangle-cloud/src/data/services/useServiceRequestSecurityRequirements.ts`; `apps/tangle-cloud/src/data/services/useServiceSecurityRequirements.ts`; `apps/tangle-cloud/src/pages/instances/Instances/UpdateBlueprintModel/ServiceRequestDetailModal.tsx`; `apps/tangle-cloud/src/pages/services/[id]/JoinServiceModal.tsx` | `rg -n "getServiceRequestSecurityRequirements|getServiceSecurityRequirements|Unable to load security requirements" apps/tangle-cloud/src/data/services apps/tangle-cloud/src/pages -g'*.ts' -g'*.tsx'`; `yarn nx run tangle-cloud:typecheck --skip-nx-cache` |

## Commands Executed In This Pass

| Command | Result |
|---|---|
| `yarn nx run-many --target=test --projects=tangle-dapp,tangle-cloud,tangle-shared-ui --skip-nx-cache` | Success (dapp: 2/2 files, cloud: 5/5 files, shared-ui: 3/3 files) |
| `yarn nx run tangle-cloud:typecheck --skip-nx-cache` | Success |
| `rg -n "/native-staking|PagePath\\.NATIVE_STAKING" apps/tangle-dapp/src/app/app.tsx apps/tangle-dapp/src/components/Sidebar/sidebarProps.tsx apps/tangle-dapp/src/types/index.ts` | No matches (native staking is not user-facing in launch UI) |
| `rg -n "TxHistoryDrawer|TxHistoryNotifier|TxConfirmationModal" apps/tangle-cloud/src/components apps/tangle-cloud/src -g'*.ts' -g'*.tsx'` | Confirms notifier/drawer/modal wiring in cloud layout/header |
| `rg -n --no-heading "\.restaking(Status|Stake|DelegationCount|LeavingRound|ScheduledUnstakeAmount|ScheduledUnstakeRound)" apps libs -g'*.ts' -g'*.tsx'` | No matches |
| `rg -n "getServiceRequestSecurityRequirements|getServiceSecurityRequirements|Unable to load security requirements" apps/tangle-cloud/src/data/services apps/tangle-cloud/src/pages -g'*.ts' -g'*.tsx'` | Confirms fail-closed read hooks and explicit UI error messaging |
| `rg --files | rg -i '(playwright|cypress|e2e|\.feature$)'` | No dedicated browser E2E harness found |

## Blockers to Claim 100% Complete
- Migration claim is still partial for live wallet+relayer reliability (`/claim/migration`).
- Native staking pod lifecycle remains non-launch scope and hidden from user-facing routing.
- Native restaking contract/user-flow coverage is intentionally excluded from launch certification.
- No dedicated browser E2E harness (Playwright/Cypress) exists in this repo; wallet-connected critical paths remain manual.
- Automated tests are still narrow (10 test files total) compared with 300 documented stories.
- Catalog legacy `[MANUAL_REQUIRED]` tags under-report manual dependence (30 tags) relative to stories carrying manual-path evidence (246).

## Notes
- This report claims only commands executed in this pass.
- Statuses are intentionally conservative and do not treat lint/typecheck/build presence as end-to-end user-flow verification.

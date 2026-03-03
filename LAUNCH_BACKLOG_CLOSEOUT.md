# Launch Backlog Closeout (Docs Scope)

Date: 2026-03-03  
Scope owner: `docs/` flow validation artifacts + top-level backlog docs in this repo

## Decision Rules
- `fixed-now`: Documentation/process gap closed in this pass.
- `deferred-external`: Real work remains, but completion depends on external repo/infrastructure/runtime actors.
- `removed-non-actionable`: Not a launch action item for this repo/scope.

## TODO Triage Register

| backlog_id | source | item | triage | owner | dependency | disposition |
|---|---|---|---|---|---|---|
| TODO-001 | `docs/flow-validation-report.md`, `docs/staking-flow-audit-checklist.md` | No explicit launch gate board with owner + gate criteria + verification command + status | fixed-now | Docs owner | None | Added `docs/launch-readiness-board.md` + `docs/launch-readiness-board.csv`; linked from all flow artifacts. |
| TODO-002 | `docs/flow-validation-report.md`, `docs/staking-flow-audit-checklist.md` | Migration claim flow still partial for launch confidence | fixed-now | dapp-frontend + migration | Manual runtime sign-off on live wallet/relayer paths | Hardened migration claim flow in dapp (fail-closed config + relayer receipt confirmation + surfaced eligibility errors); gate moved to `ready-manual-signoff`. |
| TODO-003 | `docs/flow-validation-report.md`, `docs/staking-flow-audit-checklist.md` | Native staking pod lifecycle launch certification | removed-non-actionable | Product/Protocol | Launch scope decision | Kept documented as out-of-launch scope; no release gate in dapp launch. |
| TODO-004 | `docs/flow-validation-report.md`, `docs/staking-flow-audit-checklist.md` | Native restaking contract/user-flow certification | removed-non-actionable | Product/Protocol | Launch scope decision | Explicitly excluded from launch certification; retained only as historical compatibility note. |
| TODO-005 | `docs/flow-validation-report.md`, `docs/staking-flow-audit-checklist.md` | Missing dedicated browser wallet E2E harness | deferred-external | QA/DevEx | Browser wallet automation harness + stable CI runner wallets | Launch board marks wallet-critical flows as manual-signoff required. |
| TODO-006 | `docs/flow-validation-report.md` | Automated tests too narrow for 300-story catalog confidence | deferred-external | QA + App teams | Deterministic end-to-end suite design and infra budget | Left as risk; not closed by doc-only pass. |
| TODO-007 | `docs/flow-validation-report.md`, `docs/user-stories-validation-catalog.md` | Legacy `[MANUAL_REQUIRED]` tag metric is misleading/under-counted | fixed-now | Docs owner | None | Deprecated this metric as launch gate input; canonical gate source is launch board + `implementation_status`. |
| TODO-008 | `MIGRATION_CLAIM_PLAN.md` | Historical implementation plan appears actionable in this repo | removed-non-actionable | Migration (tnt-core) | Work migrated to `../tnt-core/packages/migration-claim` | Marked archived context only; not tracked as dapp backlog action. |

## Unresolved Blockers After Closeout
- Wallet-critical flows remain `implemented+manual-required` until deterministic browser wallet E2E harness exists.
- Native staking lifecycle remains intentionally out of launch scope (not a launch blocker, but not complete).

## Governance Decision Inputs (Current)
- Go/no-go authority should use `docs/launch-readiness-board.csv` as the gate source, with this file as backlog disposition context.
- A strict launch go decision requires: no `blocked-partial` gates, plus manual sign-off evidence for all `ready-manual-signoff` gates.
- If launching with manual-signoff gates, record explicit risk acceptance for TODO-005 and TODO-006.
- `removed-non-actionable` items (TODO-003, TODO-004, TODO-008) require explicit product scope approval so they are not reintroduced as hidden blockers.

## Launch Answer (Strict)
- Are all user flows complete for launch-certifiable automation? **No.**

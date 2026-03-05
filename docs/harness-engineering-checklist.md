# Harness Engineering Checklist

Use this checklist for launch-flow-impacting work.

## Design

- [ ] Flow scope is mapped to `flow_id` values in `docs/launch-readiness-board.csv`.
- [ ] Acceptance criteria distinguish happy-path vs explicit blocker path.
- [ ] Critical-flow impact is identified up front.
- [ ] Flow owner and release/harness owner are assigned in the PR.

## Implementation

- [ ] Criteria updates are route-resilient (canonical-route recheck where needed).
- [ ] Tx checks include objective signals (tx history delta and/or explicit blocker copy).
- [ ] New env toggles are documented in `docs/wallet-flow-suite.md`.

## Verification

- [ ] Run suite (full or targeted): `yarn test:wallet-flows`.
- [ ] Inspect `suite/report.json` for `verified` and `agentSuccess`.
- [ ] Inspect `suite/release-matrix.md` classification counts.
- [ ] Run gate: `yarn test:wallet-flows:gate`.
- [ ] If release strictness is required, run: `yarn test:wallet-flows:gate:strict`.
- [ ] Confirm matrix artifacts exist (`json`, `csv`, `md`) under suite output.

## Critical Flows

- [ ] `FLOW-001` happy-path-pass
- [ ] `FLOW-002` happy-path-pass
- [ ] `FLOW-005` happy-path-pass
- [ ] `FLOW-010` happy-path-pass
- [ ] `FLOW-011` happy-path-pass
- [ ] `FLOW-013` happy-path-pass
- [ ] `FLOW-014` happy-path-pass
- [ ] `FLOW-018` happy-path-pass
- [ ] `FLOW-019` happy-path-pass

## PR Hygiene

- [ ] PR description includes matrix summary (happy/blocker/failed).
- [ ] Any blocker-or-partial critical flow has explicit exception, owner, and ETA.
- [ ] Evidence links are included (artifact directory or CI artifact URLs).
- [ ] If launch-impacting, PR approval includes a release-captain signoff.

## Post-Merge

- [ ] If semantics changed, update `CLAUDE.md` runbook section.
- [ ] If recurring flake found, add flow id to flaky rerun set in spec.
- [ ] File a follow-up for fixture/indexer reliability if blocker-pass rate is rising.
- [ ] Update weekly trend snapshot with this run's matrix totals.

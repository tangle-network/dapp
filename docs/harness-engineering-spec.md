# Harness Engineering Operating Spec

Last updated: 2026-03-05

## Why This Exists

This repo has strong momentum but still leaks reliability through:
- flow verification that can pass without happy-path completion
- drift between “what docs say” and “what release gates enforce”
- scattered operational knowledge across AGENTS/CLAUDE/docs/PR threads
- weak mechanical governance on release evidence quality

This spec defines the senior-level operating model to convert harness work into predictable release outcomes.

## Scope

In scope:
- launch-critical dApp flows validated by the wallet flow suite
- release-go/no-go evidence used by maintainers
- repository process changes that make agent execution more reliable

Out of scope:
- full native restaking UX (deprioritized)
- replacing manual signoff for flows that require external non-local actors

## Source Principles

Based on OpenAI Harness Engineering guidance:
- optimize for stable maps, not giant prompts
- enforce output quality mechanically (not by intention)
- classify evidence quality explicitly (not pass/fail only)
- continuously prune stale knowledge and keep docs compact

Reference:
- https://openai.com/index/harness-engineering/

## Current Gaps In This Repo

1. `verified` and `agentSuccess` can diverge, but were historically treated as equivalent in go/no-go conversations.
2. Launch evidence was captured, but not classified into quality tiers for release decisions.
3. Critical flows did not have hard happy-path enforcement by default.
4. PR reviews lacked a required harness evidence checklist.
5. No single script existed to fail release gate when matrix quality degraded.
6. Harness process details were spread across files without one operating contract.

## Target Operating Model

### 1) Two-Layer Pass Semantics

- `verified=true`:
  - criteria passed (tx delta OR explicit blocker state)
- `agentSuccess=true`:
  - agent completed intended narrative without terminal tool/runtime failure

Both are reported. Never collapse them into one metric.

### 2) Matrix-Based Evidence

Every run produces matrix artifacts:
- `suite/release-matrix.json`
- `suite/release-matrix.csv`
- `suite/release-matrix.md`

Each flow is classified as:
- `happy-path-pass`
- `blocker-or-partial-pass`
- `failed`

### 3) Critical-Flow Strictness

Critical flows require happy-path completion (`agentSuccess=true`) even when `verified=true`.

Default critical set:
- `FLOW-001`, `FLOW-002`, `FLOW-005`, `FLOW-010`, `FLOW-011`, `FLOW-013`, `FLOW-014`, `FLOW-018`, `FLOW-019`

### 4) Mechanical Gate Script

Release gate is enforced by:
- `yarn test:wallet-flows:gate`

Script behavior:
- fails on `failed` rows above threshold
- fails on missing critical flow rows
- fails when critical flows are not `happy-path-pass` (unless explicitly overridden)

### 5) PR Governance

PR template requires harness evidence for launch-flow-impacting changes:
- report artifact review
- release matrix review
- gate script output
- critical flow exceptions explicitly documented

### 6) Ownership And Escalation

- Flow owner: feature owner who changed launch-flow behavior.
- Harness owner: engineer running/triaging suite output for release cut.
- Escalation owner: release captain when critical-flow gate fails.

Escalation rules:
- critical flow failing: block merge to release branch until fixed or exception signed off
- blocker-or-partial trend worsening for 2 consecutive release cycles: open remediation issue with owner and ETA
- missing evidence in PR: do not approve launch-impacting changes

### 7) CI Policy

- Pre-merge (required):
  - lint/type/build
  - harness gate output for launch-flow-impacting PRs
- Nightly (required):
  - full wallet flow suite
  - matrix trend snapshot committed/attached as artifact
- Weekly hygiene (required):
  - rerun known flaky flows
  - open targeted cleanup PRs for recurring failure patterns

### 8) Definition Of Done (Launch-Flow Changes)

All must be true:
- code merged with tests/checks passing
- release matrix generated and attached
- `failed=0`
- all critical flows are `happy-path-pass`
- any non-critical blocker-or-partial rows have owner + ETA + issue link
- docs updated if semantics/criteria changed

## Required Commands

Run suite:
- `yarn test:wallet-flows`

Run gate:
- `yarn test:wallet-flows:gate`

Strict blocker cap:
- `yarn test:wallet-flows:gate:strict`

## SLOs (Release Quality)

Release candidate targets:
- `failed = 0`
- critical flows: all `happy-path-pass`
- blocker/partial flows: explicitly justified, tracked, and owner-assigned

Escalation:
- any critical regression blocks merge to release branch
- any blocker growth trend over 2 consecutive release cycles requires remediation plan

## Change Management

When flow criteria are modified:
1. rerun impacted flow IDs
2. rerun known flaky set (`FLOW-007`, `FLOW-013`, `FLOW-016`)
3. update docs if semantics changed
4. include before/after matrix summary in PR

## 30/60 Day Rollout

Within 30 days:
1. enforce PR harness validation section for launch-impacting PRs
2. require gate output in release candidate PR descriptions
3. publish weekly matrix trend summary

Within 60 days:
1. add nightly suite + gate CI job
2. add auto-generated matrix trend dashboard doc
3. codify recurring cleanup cadence as a standing maintenance task

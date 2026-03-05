# App State Audit (2026-03-05)

## Scope

- Apps reviewed: `tangle-dapp`, `tangle-cloud`, `leaderboard`
- Source-of-truth cross-check: `~/code/tnt-core/indexer/schema.graphql`
- Goals:
  - current runtime/build/test state
  - indexer connectivity status
  - design/UX/system-level gaps

## Executive Summary

- `tangle-dapp`: healthy build/test state; indexer wiring uses shared Envio utilities with on-chain fallback.
- `tangle-cloud`: healthy build/test state; indexer wiring uses shared Envio utilities and tx refresh patterns.
- `leaderboard`: connected to `tnt-core` Envio schema and functional, but has correctness and scalability gaps that should be fixed before calling it production-grade.

## Verification Evidence

- `yarn nx test tangle-dapp` -> pass (`31` tests)
- `yarn nx test tangle-cloud` -> pass (`49` tests)
- `yarn nx test leaderboard` -> pass but no tests found
- `yarn nx build tangle-dapp` -> pass
- `yarn nx build tangle-cloud` -> pass
- `yarn nx build leaderboard` -> pass

## Indexer Connectivity Validation

### `leaderboard` is connected to `tnt-core` indexer entities

- Leaderboard queries `PointsAccount` + `snapshots`: [leaderboardQuery.ts](/home/drew/code/dapp/apps/leaderboard/src/features/leaderboard/queries/leaderboardQuery.ts#L90)
- Role filters query `Operator`, `Delegator`, `Blueprint`, `JobCall`: [leaderboardQuery.ts](/home/drew/code/dapp/apps/leaderboard/src/features/leaderboard/queries/leaderboardQuery.ts#L276)
- These entities/fields exist in `tnt-core` schema:
  - `PointsAccount` / `PointsSnapshot`: [schema.graphql](/home/drew/code/tnt-core/indexer/schema.graphql#L798)
  - `Operator`, `Blueprint`, `Service`, `JobCall`: [schema.graphql](/home/drew/code/tnt-core/indexer/schema.graphql#L193)
  - `Delegator`: [schema.graphql](/home/drew/code/tnt-core/indexer/schema.graphql#L518)

### Caveat

- `chain_metadata` query in leaderboard sync chip is Hasura/Envio metadata-table dependent and not part of the app-level GraphQL schema contract:
  - [indexingProgressQuery.ts](/home/drew/code/dapp/apps/leaderboard/src/features/indexingProgress/queries/indexingProgressQuery.ts#L13)

## Findings (Ordered by Severity)

### High

1. Pagination count is incorrect in leaderboard
- `totalCount` is set to the current page filtered length, not global count:
  - [leaderboardQuery.ts](/home/drew/code/dapp/apps/leaderboard/src/features/leaderboard/queries/leaderboardQuery.ts#L202)
- Impact: pagination controls and UX can be incorrect on multi-page datasets.

2. Role filtering query does unbounded full-table scans
- Queries all `Operator`, filtered `Delegator`, all `Blueprint`, all `JobCall` with no paging/aggregation:
  - [leaderboardQuery.ts](/home/drew/code/dapp/apps/leaderboard/src/features/leaderboard/queries/leaderboardQuery.ts#L276)
- Impact: slow queries and degraded UX as data grows.

### Medium

3. Indexing “target” is synthetic (`latest + 1`)
- [indexingProgressQuery.ts](/home/drew/code/dapp/apps/leaderboard/src/features/indexingProgress/queries/indexingProgressQuery.ts#L79)
- Impact: “Synced” can be noisy/misleading.

4. Leaderboard has zero automated tests
- No `*.test.*`/`*.spec.*` files under `apps/leaderboard/src`.
- Impact: regressions are likely to slip through.

5. Team-account filter placeholder is not production-ready
- Placeholder zero address only:
  - [leaderboardQuery.ts](/home/drew/code/dapp/apps/leaderboard/src/features/leaderboard/queries/leaderboardQuery.ts#L7)
- Impact: internal accounts may appear in rankings.

### Low

6. Product copy drift in leaderboard
- Mentions “nominating” in hero copy:
  - [index.tsx](/home/drew/code/dapp/apps/leaderboard/src/pages/index.tsx#L17)
- Impact: terminology drift vs current EVM/operator-layer framing.

7. Bundle size is high across apps
- Build outputs include large chunks (notably `tangle-dapp` and `tangle-cloud`).
- Impact: page-load/perf cost on slower clients.

## Design/System Audit Snapshot

- Shared visual system is consistent across apps (common UI provider/layout patterns).
- `leaderboard` is structurally minimal (single index route):
  - [app.tsx](/home/drew/code/dapp/apps/leaderboard/src/app/app.tsx#L19)
- Immediate design quality opportunity is not style mismatch, but trust/clarity:
  - fix pagination truth
  - fix sync indicator semantics
  - align copy and data filters to production policy

## Recommended Remediation Checklist

### P0 (Do Now)

- [ ] Add aggregate count query for leaderboard pagination (or disable fake total pagination).
- [ ] Replace unbounded role-account query with server-side role-filtered leaderboard query strategy.
- [ ] Make sync indicator explicit (`indexed block`, `network head`, `lag`) or mark as “index activity” instead of “synced”.

### P1 (Next)

- [ ] Add leaderboard tests:
  - pagination/total-count behavior
  - role filter correctness
  - endpoint fallback behavior
  - sync indicator rendering states
- [ ] Move leaderboard endpoint resolution to shared `executeEnvioGraphQL` utility to avoid drift.
- [ ] Configure real team account exclusion list via env/config instead of hardcoded placeholder.

### P2 (Cleanup)

- [ ] Update leaderboard hero copy to current protocol terminology.
- [ ] Performance pass: chunking strategy + heavy icon/network asset lazy loading.


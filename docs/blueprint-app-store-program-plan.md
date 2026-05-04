# Tangle Cloud — Blueprint App Store Program Plan

Status: **DRAFT, in-flight** · Owner: drew · Last updated: 2026-05-04

---

## North star

Tangle Cloud is the user-facing storefront where blueprint authors **publish hosted apps** (not bare protocol services) and where customers **discover, deploy, and run** those apps with TEE-grade security guarantees. Same primitives as today (Master Blueprint Service Manager, operator selection, service request, attestation) — but every blueprint that ships is rendered through a **per-app surface manifest** so the customer sees a tailored product, not a generic protocol form.

End-state acceptance:

1. A blueprint author signs a publish transaction once. The blueprint becomes **discoverable** in Cloud's catalog with their publisher namespace, branding, descriptive metadata, and the surface configuration they declared.
2. A customer browses, picks the app, deploys via Cloud's checkout, and lands on a **bespoke management surface** (overview cards, action buttons, resource views, vault/secrets, metrics, permissions) defined by the author's manifest.
3. TEE-required deployments enforce nonce-bound attestation **on-chain** before the service is considered provisioned. Direct unverifiable TDX is rejected.
4. Operators see the same app-shaped lens when registering capacity — they know what they're hosting and what guarantees they're committing.
5. Every flow has a measurable harness gate; the launch-readiness board is green for all critical flow IDs.

---

## Layered architecture

| Layer                 | Repo                                                                                       | Role in app store                                                                                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contracts             | [tnt-core](https://github.com/tangle-network/tnt-core)                                     | `MBSMRegistry` (versioned/pinned per blueprint), `ServicesApprovals` BLS+commitment paths, `TeeAttestationCommitment` (operator commits to backend + measurement + nonce at approval). AppRegistry was scoped and **deferred to v2** until external publisher demand exists — see Workstream B below. |
| Sandbox runtime + TEE | [ai-agent-sandbox-blueprint](https://github.com/tangle-network/ai-agent-sandbox-blueprint) | Sidecar attestation, nonce binding, capability plumbing (`SIDECAR_CAPABILITIES`), runtime backends (Docker / Firecracker / TEE: AWS Nitro, Phala, GCP CC, Azure SKR, Direct TDX) — **TEE chain-of-trust shipped**                                                                                     |
| Shared UI library     | [blueprint-ui](https://github.com/tangle-network/blueprint-ui)                             | Chain/Web3 components, ABI exports, job utils, generic protocol surfaces — **needs npm publication**                                                                                                                                                                                                  |
| Sandbox UI library    | `@tangle-network/sandbox-ui` (npm)                                                         | Sandbox-specific components — at v0.10.2 on npm; dApp pinned to ^0.6.1 (gap)                                                                                                                                                                                                                          |
| Storefront            | [dapp](https://github.com/tangle-network/dapp) (`apps/tangle-cloud/`)                      | Catalog, deploy checkout, instance lifecycle, earnings/rewards/operators surfaces; needs surface-driven app rendering                                                                                                                                                                                 |

---

## Current state — what's shipped vs what's not

### Shipped (all merged)

- Tangle Cloud blueprint host platform adoption (#3155)
- Curated sandbox blueprint module (#3156)
- Hosted blueprint tier-2 contract rollout (#3157)
- Pinned blueprint metadata verification (#3158, #3159)
- Tangle Cloud blueprint registration redesign (#3161)
- TEE attestation runtime handoff (sandbox-blueprint #48)
- Local TEE instance deployment (#49)
- Nonce-bound TDX rejection (#50)
- Local blueprint dap flow (#51)
- Nitro caller-nonce binding (#52)
- Real TEE manager e2e harness (#53)
- Sidecar capability plumbing (#54)
- Pre-mainnet security hardening: cross-chain slash dedup, payment-active operator filtering, oracle hardening, MBSM versioning, BLS+commitment service approval, beacon proof refinements (tnt-core PR #115)

### In-flight (this batch)

- **dapp PR-A** — Tangle Cloud cross-page UX redesign: unified hero cards, wallet-gated empty states, blueprint catalog filter overhaul, deploy checkout review surface, sidebar/header/table polish (24 files, +1146/−323).
- **dapp PR-B** — Tier-2 declarative blueprint app schema salvage: `BlueprintHostCard`, theme/overviewCards/actions/resourceViews/modules schema additions, three new authoring helpers (`requiresIpfsForBlueprintMetadata`, `isAllowedBlueprintMetadataUri`, `computeBlueprintMetadataPayloadHash`).

### Gap-to-done

The work to get from "we host blueprints" to "Tangle Cloud is an app store" lives in five workstreams below.

---

## Workstream A — Surface-driven app rendering (dapp + blueprint-ui)

The tier-2 schema (PR-B) defines `theme`, `overviewCards`, `actions`, `resourceViews`, `modules`. The schema is **typed but not consumed end-to-end**. Ship the consumption.

### Acceptance

- [ ] `BlueprintHostCard` reads each surface field and renders it; missing fields fall back to generic protocol surfaces (no app forced to fill every field).
- [ ] App detail page (`pages/blueprints/[id]/page.tsx`) detects the surface manifest via `useResolvedBlueprintView` and switches render path: app-mode vs generic-mode, no behavior fork inside JSX.
- [ ] Deploy checkout (`pages/blueprints/[id]/deploy/page.tsx`) honors `actions[].kind === 'deploy'` overrides (e.g., custom labels, default args, hidden fields).
- [ ] Instance management (`pages/instances/.../page.tsx`) renders `resourceViews` as live tables/grids/timelines bound to the instance's GraphQL feed.
- [ ] At least 3 reference apps published with full surface manifests in the curated catalog (e.g., trading-blueprint, ai-agent-sandbox, distributed-inference) so the rendering paths see real input.
- [ ] Snapshot tests cover each surface field × {present, absent, malformed}.
- [ ] Storybook coverage retired or migrated; surface rendering is the source of truth.

### Critical files

- `libs/tangle-shared-ui/src/blueprintApps/types.ts` — schema shape (PR-B)
- `apps/tangle-cloud/src/blueprintApps/useResolvedBlueprintView.ts` — view resolver
- `apps/tangle-cloud/src/components/blueprintApps/BlueprintHostCard.tsx` — main render
- `apps/tangle-cloud/src/pages/blueprints/[id]/{page,deploy/page}.tsx` — surface entry points
- `apps/tangle-cloud/src/pages/instances/Instances/{AllServicesTable,RunningInstanceTable}.tsx` — resource view targets

### Risks

- **Schema drift**: surface manifest must stay forward-compatible. Versionize from day one (`blueprintUi.schemaVersion`); reject unknown major versions; warn on unknown minors.
- **Form-builder XSS**: `actions[].fields` accept user-defined labels/help text. Render via plain text + a strict allowlist for inline links.
- **Layout fragmentation**: each app could ship a different visual hierarchy. Lock the page chrome (header, hero card, metric grid); let surfaces fill content blocks within fixed slots.

---

## Workstream B — App registry contract (DEFERRED to v2)

**Status: deferred.** A first draft of `AppRegistry.sol` shipped in [tnt-core PR #117](https://github.com/tangle-network/tnt-core/pull/117) was cut after review. The contract added publisher namespaces, version pinning, and governance-verified/revoke flags — all real concerns in a multi-publisher world, none of which the current single-publisher state actually exercises.

### Why deferred

The customer experience does not depend on an on-chain `appId`. They click a catalog entry, configure args, submit a service request, watch operators provision instances. The catalog can be:

- a frontend-curated list (today: `apps/tangle-cloud/src/blueprintApps/registry.ts`), OR
- an on-chain registry the frontend reads.

Both produce the same customer flow. The on-chain version only adds value when:

1. **Multiple third-party publishers exist** and need stable, non-squattable namespaces.
2. **Permissionless app discovery** is required (frontend curation is unacceptable).
3. **On-chain governance verify/revoke** must be verifiable independently of the frontend.

None of those hold today. Tangle is effectively the only publisher. The frontend curated registry is sufficient and ships immediately.

### Reactivation trigger

Open this workstream when **at least 2 third-party publishers** request stable namespaces, OR when a partner integration requires permissionless on-chain app discovery (e.g., a third-party UI consuming the catalog without trusting Tangle's frontend).

### What ships in the meantime

Publisher branding + surface manifests continue to live in the blueprint's IPFS metadata URI, verified via the metadata-hash pinning that already shipped in #3158. New Tangle products land as new entries in the frontend curated registry.

---

## Workstream C — TEE attestation as a first-class service commitment

`ServicesApprovals` (PR #115) introduces `approveServiceWithCommitments`. TEE attestation is a natural variant of `OperatorSecurityCommitment` — the operator commits "I will provision inside backend B with measurement M, bound to nonce N".

### Acceptance

- [ ] Extend `OperatorSecurityCommitment` with optional `teeBackend`, `expectedMeasurement`, `nonceBinding` fields.
- [ ] On approval: contract verifies attestation document signature for the declared backend (Phala dstack, AWS Nitro, GCP CC, Azure SKR — DCAP for direct TDX rejected as today).
- [ ] On `_handleProvisionResult`: cross-check the runtime attestation against the approval-time commitment. Mismatch → revert.
- [ ] Phala/Nitro/GCP/Azure verifier libraries imported as Solidity precompiles or off-chain helper with on-chain root-of-trust pin.
- [ ] Integration test: end-to-end deploy via dApp → operator commits with TEE — chain rejects when measurement diverges.
- [ ] Operator UI shows "TEE-required" badge and prefills commitment from the runtime's expected measurement.
- [ ] Customer UI shows attestation receipt link in instance detail (decoded report fields).

### Risks

- **Verifier contract size**: full DCAP verifier in Solidity is huge. Use precompile or split into helper contract; bound gas with measurement-only verification on-chain and full report verification on indexer side.
- **Backend drift**: each cloud TEE backend rotates root certificates. Ship `setBackendRootCa(backend, ca)` governance call; document rotation cadence.
- **Direct TDX gap**: Drew already rejected nonce-bound direct TDX (PR #50). Documented limitation; add explicit error in dApp UI when blueprint declares TDX-only.

---

## Workstream D — Sandbox-UI / blueprint-ui packaging

dApp pins `@tangle-network/blueprint-ui` to a github-tarball commit hash (`470fe863…`). dApp pins `@tangle-network/sandbox-ui` to ^0.6.1 (npm 0.10.2 available). This is fragile for an app store where multiple consumers (operators, partner UIs, blueprint dev kits) need a stable shared layer.

### Acceptance

- [ ] Publish `@tangle-network/blueprint-ui` to npm with semver discipline (start at 0.2.0; reserve 1.0.0 for surface-manifest GA).
- [ ] dApp upgrades to `^0.2.0` and removes github-tarball pin from `package.json`.
- [ ] `@tangle-network/sandbox-ui` upgraded from 0.6.1 → 0.10.2; breaking changes triaged and adapted in dApp.
- [ ] Both libs ship a CHANGELOG and a published API surface report (api-extractor or tsdoc snapshot).
- [ ] CI in dApp: `yarn install` against npm only, no tarball; lockfile asserts.
- [ ] Blueprint-author getting-started guide references npm install path, not git clone.

### Risks

- **Sandbox-ui jump 0.6→0.10**: prop and theme breakages likely. Budget 1–2 days for migration.
- **Provenance**: enforce npm publish via tokenless OIDC (already the policy in sandbox-blueprint repo per #15/#17).

---

## Workstream E — Production TEE backend validation

Nitro is wired but untested against a real AWS account. Direct TDX is local-only and rejected. Firecracker doesn't support port mapping. Phala dstack works in dev.

### Acceptance

- [ ] Real AWS Nitro provision test: spin a sandbox via `TEE_BACKEND=nitro`, real EC2 + KMS, attestation captured, sealed secrets injected, service started, attestation cross-checked against commitment.
- [ ] Firecracker host-agent extended to accept `metadata_json.ports: [{container_port, host_port}, ...]`; runtime adapter wired.
- [ ] Phala dstack production runbook: required env, root CA pin, support contact, rotation cadence.
- [ ] GCP Confidential Space and Azure SKR reach feature parity with Nitro (same contract surface, same dApp UX, same harness coverage).
- [ ] Wallet-flow harness adds critical FLOW for `TEE_REQUIRED_DEPLOY_HAPPY_PATH` and `TEE_ATTESTATION_MISMATCH_REJECT`.
- [ ] Auth-path GC fix: `scoped_session::resolve_bearer` lazy-GCs only at threshold (current 22.8 µs @ 10k sessions → target sub-1 µs). Bench regression gate added to CI.

---

## Sequencing & dependencies

```
                 ┌─────────────────────────────┐
                 │ A1  PR-A (cross-page UX)    │   ◄── ships now (this batch)
                 └─────────────┬───────────────┘
                               ▼
                 ┌─────────────────────────────┐
                 │ A2  PR-B (tier-2 schema)    │   ◄── ships now (this batch)
                 └─────────────┬───────────────┘
                               ▼
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌────────────────────┐                    ┌──────────────────────────┐
│ A3  Surface-driven │                    │ D   blueprint-ui /       │
│     app rendering  │                    │     sandbox-ui npm pub   │
└──────────┬─────────┘                    └────────────┬─────────────┘
           ▼                                            ▼
┌────────────────────┐                    ┌──────────────────────────┐
│ C   TEE commitment │ ◄──────────────────│ surface manifest stable  │
│     in approvals   │                    └──────────────────────────┘
│  (PR #117)         │
└──────────┬─────────┘
           ▼
┌────────────────────┐
│ E   Production TEE │
│     validation     │
└────────────────────┘

(B  AppRegistry  ─── deferred to v2; gated on external publisher demand)
```

| Workstream                                                                        | Blocked by                | Effort             | Owner | Target |
| --------------------------------------------------------------------------------- | ------------------------- | ------------------ | ----- | ------ |
| PR-A (cross-page UX)                                                              | —                         | shipped            | drew  | done   |
| PR-B (tier-2 schema)                                                              | —                         | shipped            | drew  | done   |
| A3 surface rendering                                                              | PR-B                      | 5–7 d              | TBD   | +2 w   |
| D npm publish + sandbox-ui upgrade                                                | —                         | shipped (PR #3164) | drew  | done   |
| C TEE commitment ([PR #117](https://github.com/tangle-network/tnt-core/pull/117)) | tnt-core #115 (merged)    | shipped            | drew  | done   |
| E production TEE validation                                                       | C                         | 5–7 d              | TBD   | +6 w   |
| **B AppRegistry contract**                                                        | external publisher demand | **deferred**       | —     | v2     |

---

## Harness gates (no merge without these)

Per `docs/harness-engineering-spec.md` and `docs/launch-readiness-board.csv`:

- **Critical flows must be `happy-path-pass`** — `FLOW-001,002,005,010,011,013,014,018,019` plus new app-store flows once added.
- **Wallet-flow suite**: `yarn test:wallet-flows:gate` (or `:strict`) green per PR.
- **Wallet-flow preflight**: `eth_chainId == 0x7a69` on `127.0.0.1:8545`, Hasura reachable on `:8080`, dApp env points at local indexer.
- **No `turns=0` results** count as evidence.
- **App-store-specific flows to add to the board** (new):
  - `FLOW-APP-001` Browse catalog → app detail surface renders (no forced empty grid)
  - `FLOW-APP-002` Publish app via authoring form → IPFS upload → on-chain register
  - `FLOW-APP-003` Deploy app with TEE-required, attestation OK
  - `FLOW-APP-004` Deploy app with TEE-required, attestation mismatch → reverts cleanly
  - `FLOW-APP-005` Operator registers capacity for app → commitment verified

---

## Risk register (top 10)

| #   | Risk                                                   | Severity | Mitigation                                                                          |
| --- | ------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------- |
| 1   | Schema drift between dApp render and on-chain manifest | High     | Pin `blueprintUi.schemaVersion`; reject unknown majors; emit `SchemaMismatch` event |
| 2   | Surface XSS via author-controlled labels               | High     | Plain-text only; URL allowlist; CSP review                                          |
| 3   | TEE root-CA rotation breaks live deploys               | High     | Backend root-CA setter behind governance; runbook + alerting                        |
| 4   | DCAP verifier gas blow-up                              | Medium   | Precompile or off-chain verify with on-chain anchor                                 |
| 5   | Namespace squatting if AppRegistry ships prematurely   | Medium   | Workstream B is deferred; revisit once external publisher demand exists             |
| 6   | sandbox-ui 0.6 → 0.10 prop breakage in dApp            | Medium   | Adapter layer + visual regression run before merge                                  |
| 7   | Indexer schema lag for new events                      | Medium   | Envio schema PR coupled to contract PR; CI asserts both ship together               |
| 8   | Operator UX divergence (operator vs customer surfaces) | Medium   | One source-of-truth manifest, two render modes; snapshot parity tests               |
| 9   | Auth-path GC perf at scale (22.8 µs @ 10k)             | Low      | Lazy-GC threshold + bench regression gate (workstream E)                            |
| 10  | Direct TDX hard-rejected leaves blueprints stranded    | Low      | dApp-level error explaining; suggest Phala/Nitro alternative path                   |

---

## Definition of done — program level

The program is done when **all of the following are true** simultaneously:

1. ≥ 5 apps in the curated catalog (frontend registry), each with a non-trivial surface manifest pinned via blueprint metadata hash.
2. TEE-required deploy + attestation reject paths covered in wallet-flow harness as critical FLOW IDs and consistently green.
3. `@tangle-network/blueprint-ui` and `@tangle-network/sandbox-ui` on npm; dApp `package.json` is tarball-free.
4. Real AWS Nitro and Phala production deploys validated end-to-end with documented runbooks.
5. Auth-path bench regression gate passes (`resolve_bearer` < 1 µs @ 10k sessions).
6. `docs/launch-readiness-board.csv` shows green for all `FLOW-APP-*` IDs and all critical FLOW IDs.
7. Operator-facing app registration mirrors customer-facing app deploy 1:1 in surface coverage.

AppRegistry deployment is **NOT** a v1 done predicate. It activates as a v2 workstream once external publisher demand justifies the on-chain surface.

---

## What's NOT in scope (deferred)

- **AppRegistry contract** — deferred to v2 (Workstream B). Frontend curated registry covers v1.
- Marketplace-style discovery features (rankings, reviews, install counts) — phase 2.
- Cross-chain AppRegistry — implied deferred along with AppRegistry itself.
- Author monetization splits — orthogonal to publishing primitives; tracked separately.
- Direct TDX DCAP support — until upstream tooling matures, hard-rejected.

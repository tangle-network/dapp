# Product Design Audit

Status: First synthesis and foundation patch in progress.
Product: Tangle Cloud.
Primary users: Service customers, operators, publishers, protocol inspectors.
Reference surfaces: AWS/Cloudscape-style resource consoles, Google Cloud service observability, Vercel marketplace/project dashboard, Cloudflare Workers bindings, Datadog service catalog, LangSmith traces, Hugging Face app surfaces.
Product brief: `apps/tangle-cloud/PRODUCT_BRIEF.md`.

## Parallel Dispatch

- IA/routes/app shell: route graph, duplicated chrome, service/object workspace model.
- Visual system: color, typography, radius, shadows, hover/focus, theme posture.
- Core workflows: browse, inspect, deploy, operator selection, service status, embedded apps.
- Component states: tables, cards, drawers, wallet, modals, loading/error/empty/mobile.
- References: external console/marketplace/observability patterns and what Cloud should adopt or avoid.

## Inventory

- Route/page: `/`, `/instances`, `/services/:id`, `/blueprints`, `/blueprints/:id`, `/blueprints/:id/deploy`, `/blueprints/create`, `/blueprints/manage`, `/blueprints/:slug/:serviceId`, `/blueprints/:publisher/:slug`, `/blueprints/:publisher/:slug/:serviceId`, `/blueprints/:id/services/:serviceId`, `/operators`, `/operators/manage`, `/rewards`, `/earnings`, `/payments/pool`, `/payments/credits`, `*`.
- Components: `Layout`, `Sidebar`, `Header`, `PageLayout`, `PageHeader`, `PageToolbar`, `FilterTray`, `MetricStrip`, `TangleCloudTable`, `TangleCloudCard`, blueprint listing/detail/deploy/create/manage, service detail/job/funding/ACL panels, operator tables/manage tabs, payments/rewards/earnings, iframe host/bridge/details drawer.
- States: connected/disconnected wallet, network switching, desktop/mobile sidebar, light/dark, loading/error/empty, transaction pending/success/fail, iframe allowed/denied/unavailable, service active/pending/stopped, operator registered/slashing/exiting.
- Data dependencies: blueprint registry/indexer reads, wallet account/network, transaction history store, binary versions/audits, service requests, operator registrations, staking/TVL, private payments/credits, iframe manifests/capabilities.
- Known complaints: layout quality at 5/10, too much chrome, drift from shared design system, hard-to-follow create/deploy, post-provisioning uncertainty, cards/panels that do not prove purpose.

## Page Evaluations

### Instances

Purpose: Customer/operator home for service state.
Primary user decision: What services or pending requests need attention?
Current score: 5/10.
Target score: 8.5/10.
Findings: Label says Home while route is Instances; page mixes services, operator registration, instructions, account stats, and TVL; one-tab registered-blueprints wrapper adds chrome.
Alternatives: keep dashboard home (6), rename and focus as Services (8), split customer/operator hubs (6.5).
Decision: Move toward customer-first services workspace; keep compatibility route for now.
Changes shipped: shared table overflow fix benefits instance tables.
Remaining risk: Needs IA rewrite and clearer wallet/connect empty state.

### Service Detail

Purpose: Operate one service.
Primary user decision: Is this service healthy, funded, permissioned, and ready for jobs?
Current score: 4/10.
Target score: 9/10.
Findings: Stacks identity, blueprint marketing, protocol diagnostics, ACL, jobs, history, billing, upgrades, and membership without a single workspace hierarchy.
Alternatives: current vertical stack (4), tabbed service console (8), app/workspace-first service with App/Console/Jobs/Billing/Access/Operators/Events (9).
Decision: App/workspace-first service console is the target.
Remaining risk: Requires route/data rewrite and post-request status destination.

### Blueprints Catalog

Purpose: Find deployable blueprint/app.
Primary user decision: Is this trustworthy, available, and actionable now?
Current score: 7/10.
Target score: 9/10.
Findings: Best current route; filters are useful. Operator/publisher/customer actions still compete and category/status color can feel random.
Alternatives: card marketplace (7), table-first resource catalog (8), compact catalog cards with deploy decision metadata (9).
Decision: Keep cards for discovery but make them deploy-decision cards with trust, operator capacity, payment mode, and primary action.
Remaining risk: Needs audited tri-state and retry states.

### Blueprint Detail / Workspace

Purpose: Evaluate one blueprint/app and choose deploy/register/manage.
Current score: 6/10.
Target score: 9/10.
Findings: Same blueprint can appear as raw protocol detail, curated app, declarative host, iframe app, or numeric ID route.
Alternatives: keep split route model (5), marketplace PDP (8), canonical blueprint workspace with protocol/app tabs (9).
Decision: Canonical blueprint workspace with tabs: Overview, Operators, Versions, Activity, Deploy.
Remaining risk: Route taxonomy cleanup not complete.

### Deploy

Purpose: Submit a service request confidently.
Current score: 6/10.
Target score: 9/10.
Findings: Operator selection, ACL, raw args, payment/security, and readiness are overloaded; success routes back to blueprint detail instead of request/service status.
Alternatives: current long form (5), checkout wizard (8), focused checkout plus request status route (9).
Decision: Focused checkout; post-success must land on request/service status.
Remaining risk: Requires backend/indexer-aware status route decision.

### Create / Manage

Purpose: Publish and maintain blueprints.
Current score: Create 4/10, Manage 5/10.
Target score: 8.5/10.
Findings: Older local headers/wrappers, fixed grids, raw tables, stepper chrome.
Alternatives: local form flow (4), shared chrome cleanup (7.5), publisher workspace with compact forms and table actions (8.5).
Decision: Migrate to shared chrome and responsive publisher workspace.

### Operators

Purpose: Inspect/register/manage operator capacity.
Current score: Registry 7/10, Manage 5/10.
Target score: 9/10.
Findings: Registry is close; manage uses local tables/tooltips/modals. Missing per-blueprint capacity, latency, approvals, pricing clarity, and health.
Decision: Registry as comparison table; operator selection inside deploy should show blueprint-specific health/cost/capacity.

### Payments / Rewards / Earnings

Purpose: Manage balances, claims, private pool, credits, and publisher payouts.
Current score: 5-7/10.
Target score: 8.5/10.
Findings: Some disabled primary workflows show as disabled buttons rather than unavailable-state panels; raw tables remain.
Decision: Ledger-first pages with exact copyable records and clear unavailable states.

### Embedded Blueprint Apps

Purpose: Let publisher apps run inside Cloud with wallet/capability guardrails.
Current score: 7/10.
Target score: 9/10.
Findings: Security posture is strong; frame loading/error/retry and parent-visible denied request log are missing. `callJob` and `signTypedData` are protocol-defined but not wired.
Decision: Full-height embedded app workspace with visible capability/trust details and unavailable method banners.

## Cross-Cutting System Findings

- Navigation: duplicate route declarations were exact deadwood; route taxonomy still needs canonical workspace design.
- Theme: too many generated/random HSL accents and hard-coded gradients; target is low-chroma infrastructure console with restrained blueprint identity accents.
- Tables/charts: shared table shell clipped wide tables on mobile because card overflow hid min-width tables.
- Density: cards, shadows, and rounded surfaces are overused outside catalog/modals.
- Copy/labels: several pages explain concepts where they should show live state, cost, health, risk, or next action.
- Interactions: transaction history hidden on mobile; wallet-connect empty states use brittle DOM targeting in places; hover/focus states vary.
- Responsiveness: fixed two-column and quarter-width controls exist in deploy/create/operator flows.
- Data truth: operator health/pricing/latency, post-request status, and iframe job bridge wiring need product/data decisions.
- Production/deploy: not requested for this pass; no production proof yet.

## Alternatives

- Current split object model: score 5/10. Flexible but fragmented.
- Marketplace checkout: score 8/10. Clear provisioning funnel but can bolt service ops on afterward.
- App/workspace-first IA: score 9/10. Unifies catalog, deployment, service operation, embedded apps, and protocol state.

Decision: App/workspace-first IA, with marketplace checkout as a subflow and infrastructure-console visual posture.

## Verification

- Commands:
  - `git diff --check` passed.
  - `NX_SKIP_NX_CACHE=true yarn nx test tangle-cloud` passed: 26 files, 167 tests. Existing jsdom `window.scrollTo` warnings remain in `app.spec.tsx`.
  - `NX_SKIP_NX_CACHE=true yarn nx typecheck tangle-cloud` passed.
  - `NX_SKIP_NX_CACHE=true yarn nx build tangle-cloud` passed. Existing Rollup pure annotation and large chunk warnings remain.
- Browser checks: visual report rendered `/instances`, `/blueprints`, `/operators` dark/light plus mobile `/blueprints` to `/tmp/tangle-cloud-visual-audit`.
- Screenshots: source audit plus one rendered visual pass; deeper screenshot contact sheet still needed.
- Deployment: not requested.
- Live proof: not requested.

## Next Pass

- Canonicalize blueprint/app/service route taxonomy and remove the misleading scoped-route sibling.
- Add post-provision request/service status destination.
- Refactor `/services/:id` into a tabbed service workspace.
- Migrate create/manage/deploy to shared chrome and responsive form grids.
- Expose transaction history on mobile and replace brittle wallet-connect triggers.
- Tokenize status/color/radius/shadow choices and reduce generated hue drift.

# Product Design Audit

Status: implemented and verified locally
Product: Tangle Cloud blueprint catalog / registration / deploy flow
Primary users: deployers browsing service blueprints; operators registering capacity
Reference surfaces: existing Tangle Cloud chrome, Arena readability critique, `apps/tangle-cloud/PRODUCT_BRIEF.md`
Product brief: `apps/tangle-cloud/PRODUCT_BRIEF.md`

## Inventory
- Route/page: `/blueprints`, `/blueprints?view=grid`, `/blueprints?register=0`, `/blueprints/:id/deploy`
- Components: `BlueprintListing`, `ResultList`, `PageToolbar`, `StatusPill`, `BlueprintVisual`, `RegistrationDrawer`, `Header`, shared blueprint GraphQL hooks, shared wallet dropdown
- States: loading, cached/degraded, list, grid, mobile, disconnected register drawer, disconnected deploy gate
- Data dependencies: Envio indexer, direct chain fallback, selected Cloud network, wallet chain, React Query cache
- Known complaints: glass-on-glass catalog, duplicate page title, missing blueprint logo/image, button dots, no caching on revisit, localhost RPC failure after wallet connect, hidden wallet address, italic network text, hard-to-read colors/fonts, tiny status labels, AI Agent deploy/register blank screen

## Page Evaluations
### Blueprints Catalog
Purpose: choose a blueprint, compare capacity/trust, deploy or register.
Primary user decision: deploy available blueprint or register operator capacity.
Current score: 6/10 before; 8/10 after.
Target score: 9/10.
Findings:
- Page header duplicated the topbar breadcrumb and consumed vertical space without adding a decision.
- List rows used the same background family as the page and had no blueprint identity art.
- Mobile list forced desktop columns into 390px, hiding titles under action buttons.
- Grid cards hid actions until hover and could intermittently render blank under `content-visibility`.
Complaint ledger:
- Fixed: duplicate title removed; actions moved into toolbar.
- Fixed: list/card surfaces use elevated card background, stronger borders, and generated/default visuals.
- Fixed: mobile list has dedicated compact cards with identity, description, status, and actions.
- Fixed: deploy/register action links have explicit action classes and no pseudo-dot affordances.
- Fixed: status pills are larger and catalog capacity/audit pills omit decorative dots.
- Fixed: grid actions are visible without hover.
- Fixed: removed `content-visibility` from the result grid.
Alternatives:
- Keep dense desktop list only: 6/10; fails mobile and visual identity.
- Default to card wall everywhere: 7/10; better identity, worse operator comparison.
- Hybrid: desktop list/grid toggle with mobile-specific cards: 9/10; keeps density and mobile readability.
Decision: hybrid.
Changes shipped: `BlueprintListing`, `ResultList`, `PageToolbar`, `StatusPill`, `BlueprintVisual`, `styles.css`.
Verification: screenshots `desktop-blueprints-list.png`, `desktop-blueprints-grid-v3.png`, `mobile-blueprints-list-v3.png`; no page errors; no horizontal overflow.
Remaining risk: topbar breadcrumb still says `Blueprints`; acceptable after removing page title, but a future app-shell pass could move route context fully into page-local controls.

### Register Drawer
Purpose: register/preregister an active operator for selected blueprints.
Primary user decision: connect operator wallet or continue registration.
Current score: 7/10 before; 8/10 after.
Target score: 9/10.
Findings:
- `/blueprints?register=0` opened a nonblank drawer, but the drawer had two close controls.
Complaint ledger:
- Fixed: duplicate custom close button removed; Radix dialog close remains.
- Verified: mobile register screenshot shows connected-wallet gate, not a blank screen.
Alternatives:
- Keep drawer as-is: 6/10; looks broken.
- Replace with route page: 7/10; more work, less continuity from catalog.
- Keep drawer, remove duplicate close, preserve catalog context: 8/10.
Decision: keep drawer and remove duplicate control.
Verification: `mobile-blueprints-register-v3.png`; no page errors; no horizontal overflow.
Remaining risk: disconnected drawer still visually overlays a full-page screenshot while background content appears below in full-page captures; viewport behavior is correct.

### Deploy Gate
Purpose: prepare and submit a service request transaction.
Primary user decision: connect wallet, then configure instance.
Current score: 6/10 before; 8/10 after.
Target score: 9/10.
Findings:
- Disconnected deploy gate was generic, so a direct route such as `/blueprints/10/deploy` did not confirm the selected blueprint.
Complaint ledger:
- Fixed: disconnected deploy gate title includes the loaded blueprint name.
- Verified: `/blueprints/10/deploy` contains `AI Agent Sandbox` and `Connect`.
Alternatives:
- Generic connect gate: 6/10; route context lost.
- Full blueprint preview before wallet: 9/10; best UX but broader deploy-page composition.
- Contextual connect gate with blueprint name: 8/10; low-risk fix now.
Decision: contextual connect gate.
Verification: `desktop-ai-agent-deploy-v2.png`; no page errors; no horizontal overflow.
Remaining risk: richer disconnected preview belongs in a deeper deploy-flow pass.

## Cross-Cutting System Findings
- Navigation: removed catalog page header; topbar/sidebar remain the route shell.
- Theme: dark palette is less purple and less bright; card/list surfaces now separate from page background.
- Tables/charts: desktop list remains row-based; mobile list is not a squeezed table.
- Density: toolbar wraps on mobile instead of cramming into one 44px row.
- Copy/labels: no extra explanatory page title; statuses use larger text.
- Interactions: card actions always visible; register drawer no longer double-closes; deploy gate carries blueprint context.
- Responsiveness: 390px mobile has no horizontal overflow.
- Data truth: browse data follows selected Cloud network rather than connected wallet chain; connected wallet no longer forces read-only catalog to dead localhost RPC.
- Production/deploy: not deployed in this pass.

## Product Innovation Audit
- High-value innovation shipped: generated/default blueprint visual identity from deterministic category/name diagrams. This gives every blueprint a scannable artifact without trusting missing metadata images.
- Reliability innovation shipped: read-only blueprint queries use Cloud network selection, keep previous data, and retain cache for 30 minutes. Wallet chain is reserved for transaction context instead of browse context.
- Interaction innovation shipped: hybrid responsive catalog: desktop comparison list plus mobile action cards.
- Rejected: app-store hero/gallery treatment. It would improve screenshots but weaken operator comparison and contradict the infrastructure-console brief.
- Rejected: hiding register/deploy behind hover. It looks cleaner but makes primary actions feel missing and hurts touch devices.

## Verification
- Commands:
  - `npx nx run tangle-cloud:typecheck`
  - `npx nx build tangle-cloud`
  - `npx nx test tangle-cloud` — 26 files, 167 tests passed
  - `npx nx lint tangle-cloud` — passed with existing warnings
  - `npx nx run ui-components:typecheck`
  - `npx nx run tangle-shared-ui:test` — 5 suites, 74 tests passed
  - `npx nx lint tangle-shared-ui` — passed with existing warnings
  - `git diff --check`
- Browser checks:
  - `/blueprints`
  - `/blueprints?view=grid`
  - `/blueprints?register=0`
  - `/blueprints/0/deploy`
  - `/blueprints/10/deploy`
- Screenshots:
  - `.evolve/tangle-cloud-design-audit-2026-06-07/desktop-blueprints-list.png`
  - `.evolve/tangle-cloud-design-audit-2026-06-07/desktop-blueprints-grid-v3.png`
  - `.evolve/tangle-cloud-design-audit-2026-06-07/mobile-blueprints-list-v3.png`
  - `.evolve/tangle-cloud-design-audit-2026-06-07/mobile-blueprints-register-v3.png`
  - `.evolve/tangle-cloud-design-audit-2026-06-07/desktop-ai-agent-deploy-v2.png`
- Deployment: not requested.
- Live proof: local dev server at `http://127.0.0.1:4210` with polling due system watcher limit.

## Next Pass
- Add a richer disconnected deploy preview that shows blueprint identity, operators, and trust before wallet connect.
- Consider moving route context out of the fixed topbar in a broader app-shell pass.
- Add a configured testnet Envio endpoint to avoid expected fallback warnings during local browsing.

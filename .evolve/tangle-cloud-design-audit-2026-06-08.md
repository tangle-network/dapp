# Tangle Cloud Design Audit - 2026-06-08

Status: implemented and browser verified on `feat/tangle-cloud-tangle-dapp-system`.

## Verdict

The Blueprints page moved from glass-on-glass catalog cards to a list-first infrastructure console that matches the original Tangle dapp's operational hierarchy while keeping Cloud-specific density. The remaining surface is not a marketing hero; it is a service catalog for deployers, operators, and publishers.

## Problems Addressed

- Duplicate Blueprints title in top nav and page header.
- Separate nav/title layer doing no unique work.
- Blueprints catalog readability at roughly 6/10: same-background cards, weak hierarchy, small labels, hidden wallet address, italic controls, and decorative button dots.
- Missing default blueprint visual identity for chain-only blueprints.
- Local preview defaulting to Anvil and firing localhost RPC/indexer calls while the UI showed Base Sepolia.
- Blueprint data refetching felt uncached after leaving and returning to the page.
- Add-capacity/register flow could look blank or broken.

## Product Direction

- Use the original Tangle dapp design system selectively: wallet/network affordances, compact chrome, crisp borders, action hierarchy, and restrained Tangle color accents.
- Keep Cloud as an infrastructure console: list/table first, cards only for repeated catalog/mobile/modals, no hero marketing treatment.
- Make Blueprints read like inventory: capacity, trust, source, usage, and actions are first-order columns.

## Changes Shipped

- Removed the `/blueprints` top-nav breadcrumb title and let the page own the large `Blueprints` heading.
- Kept wallet connection visible in the top-right shell and made the connected-address affordance visible.
- Forced network/action controls to normal font style and removed button pseudo-dot artifacts.
- Added default blueprint visuals for chain-only catalog rows/cards.
- Added list-first catalog layout with metrics, availability filters, category/filter controls, grid/list toggle, pagination, and mobile cards.
- Added React Query stale/cache behavior for blueprint queries.
- Normalized Cloud's local-preview network to Base Sepolia unless `VITE_FORCE_LOCAL_CHAIN=true`.
- Moved network normalization before indexer health checks and aligned audited-status reads with the selected Cloud network.
- Made the local sandbox `Button` wrapper forward refs for Radix `asChild` compatibility.
- Tightened the add-capacity drawer into a true right-side panel.
- Stubbed `window.scrollTo` in shared Vitest setup to remove noisy route-test output.

## Verification

- `NX_DAEMON=false NX_SKIP_NX_CACHE=true yarn nx typecheck tangle-cloud`
- `NX_DAEMON=false NX_SKIP_NX_CACHE=true yarn nx test tangle-cloud`
- `NX_DAEMON=false NX_SKIP_NX_CACHE=true yarn nx build tangle-cloud`
- Playwright screenshots and console checks:
  - `/tmp/tangle-cloud-dapp-system-audit/blueprints-desktop-dark.png`
  - `/tmp/tangle-cloud-dapp-system-audit/blueprints-desktop-light.png`
  - `/tmp/tangle-cloud-dapp-system-audit/blueprints-mobile-dark.png`
  - `/tmp/tangle-cloud-dapp-system-audit/instances-desktop-dark.png`
  - `/tmp/tangle-cloud-dapp-system-audit/blueprints-add-capacity-flow.png`

Final browser counters:

- `local8545`: 0
- `local8080`: 0
- Radix ref warnings: 0
- italic controls: 0
- measured overflow: 0

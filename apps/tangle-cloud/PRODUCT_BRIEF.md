# Product Brief

Product: Tangle Cloud is the control plane for discovering, deploying, operating, and monetizing Tangle blueprint-powered services and embedded apps.

Status: Production-facing cloud console and blueprint marketplace, currently in active redesign.

Primary users: Service customers deploying blueprint instances; operators registering capacity and approving/running service requests; publishers shipping blueprint apps; protocol users inspecting trust, payments, rewards, and execution state.

Core jobs:

- Find a trustworthy blueprint or app and understand whether it can be deployed now.
- Request a service instance with the right operators, payment/security settings, and caller access.
- Track request approval, service health, jobs, payments, upgrades, and transaction history.
- Register and manage operator capacity for selected blueprints.
- Publish and maintain blueprint metadata, versions, and embedded app surfaces.

Primary workflows:

- Browse catalog -> inspect blueprint/app -> deploy service -> track request -> operate service workspace.
- Open existing service -> use app/console -> submit jobs -> inspect results/events/billing/access.
- Operator registry -> compare operators -> register capacity -> approve/reject requests -> manage slashing/exits.
- Publisher create/manage -> publish metadata/version -> inspect registrations/usage/earnings.
- Wallet/network/transaction flows that stay reachable from every route.

Critical data: Blueprint identity, publisher, version, trust/audit state, required capabilities, pricing/payment mode, operator count/health/capacity, request status, service ID, ACL callers, jobs/results, transaction receipts, balances, earnings, rewards, slashing state, iframe origin/capability policy.

Primary actions: Connect wallet, switch network, create service, register operator capacity, approve/reject request, submit job, fund/withdraw/authorize payment, publish/update blueprint, attest/revoke version, claim rewards, inspect/copy transaction and identity records.

Trust, risk, and compliance: Money, permissions, and protocol identity must be exact, copyable, and auditable. Destructive or irreversible actions need clear state, provenance, and confirmation. Embedded apps must expose origin, permissions, denied actions, and unavailable bridge methods. Empty/error/loading states must be truthful and actionable.

Design posture: Dense infrastructure console with restrained blueprint identity accents. Use compact tables, split workspaces, tabs, ledgers, event timelines, thin borders, and low-chroma status colors. Cards belong mainly to catalog discovery, repeated items, and modals. Cloud should inherit the original Tangle dapp's wallet, network, chrome, and action hierarchy where it improves operator trust, but keep Cloud pages data-first rather than marketing-first.

Non-goals: Do not reskin this as the AI trading app. Do not make a marketing landing page, decorative hero wall, app-store gallery, or purple/glow-heavy SaaS dashboard. Do not duplicate sidebar, topbar, breadcrumbs, page headers, tabs, and local nav unless each layer has a distinct job.

Evidence:

- `src/styles/chrome.ts` already defines a shared console chrome system.
- `src/app/app.tsx` currently has duplicate route declarations and ambiguous blueprint app route ownership.
- `src/pages/services/[id]/page.tsx` mixes service console, blueprint presentation, ACL, jobs, billing, and upgrade surfaces in one vertical stack.
- `src/pages/blueprints/[id]/deploy/page.tsx` submits a request but sends users back to blueprint detail instead of request/service status.
- Parallel audit reports on 2026-06-05 converged on app/workspace-first IA and infrastructure-console visual direction.
- 2026-06-08 design-system pass restored Tangle dapp-style wallet/network affordances, removed the duplicate Blueprints nav title, converted the catalog to a list-first operator-capacity surface, added blueprint default visuals, and browser-verified desktop/mobile/light/dark render states.

Open questions:

- What is the canonical status destination after a service request transaction: request ID route, pending service route, or service workspace once indexed?
- Which operator health, pricing, latency, and reliability metrics are available now versus planned?
- Should `/instances` become `/services`, or stay as a compatibility route with clearer labeling?

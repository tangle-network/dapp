import { resolveBlueprintAppView } from './resolver';
import type { BlueprintAppEntry } from './types';
import type { BlueprintIframeConfig } from './iframe/types';

/**
 * Identity that the curated registry matches against the blueprint's parsed
 * metadata (`blueprintUi.publisher.namespace` + `blueprintUi.requestedSlug`).
 *
 * All non-empty fields must match for a curated entry to claim a blueprint;
 * unset fields are treated as wildcards. This survives redeploys, multi-chain
 * deployments, and re-registration cycles — the dapp no longer needs to know
 * the on-chain blueprintId of a curated app, only the identity the publisher
 * declared in metadata.
 */
type CuratedBlueprintMatcher = {
  publisherNamespace?: string;
  requestedSlug?: string;
};

/**
 * Curated entries may carry an `iframe` block to embed the publisher's hosted
 * app (e.g. trading-arena.blueprint.tangle.tools). The block mirrors what the
 * metadata-driven parser produces for declarative blueprints — same shape, same
 * downstream consumers (`BlueprintAppLandingPage`, `BlueprintAppFrameHost`) —
 * so curated and metadata paths share the iframe surface without bespoke code.
 *
 * Curated iframe entries skip the on-chain `metadataVerification` gate (the
 * dapp itself is the source of truth for first-party apps) but the runtime
 * still enforces the manifest host suffix allowlist and the iframe sandbox
 * policy in `iframe/policy.ts`. Set `manifest.externalApp` in tandem so the
 * landing page's existing iframe gate (`mode === 'iframe'` && `trust ===
 * 'trusted'`) trips correctly.
 */
type CuratedRegistryEntry = BlueprintAppEntry & {
  match?: CuratedBlueprintMatcher;
  iframe?: BlueprintIframeConfig;
};

const entries = [
  {
    slug: 'trading',
    canonicalSlug: 'trading',
    match: {
      publisherNamespace: 'tangle',
      requestedSlug: 'ai-trading',
    },
    publisher: {
      label: 'Tangle Labs',
      visibility: 'first-party',
      verification: 'first-party',
    },
    tier: 'curated-module',
    slugPolicy: 'reserved',
    module: {
      moduleId: 'trading',
      status: 'active',
    },
    manifest: {
      displayName: 'AI Trading',
      tagline: 'Deploy and monitor trading agent services.',
      description:
        'Create a trading service, select operators, set strategy limits, and review execution records.',
      surfaces: [
        'generic-overview',
        'service-explorer',
        'service-console',
        'actions-panel',
        'resources',
        'chat',
        'vaults',
        'permissions',
        'metrics',
      ],
      resources: {
        serviceNoun: 'trading service',
        resourceNoun: 'bot',
        resourceRoute: 'bots',
      },
      permissions: [
        {
          key: 'operator.manage',
          label: 'Operator management',
          scope: 'service',
        },
        {
          key: 'vault.execute',
          label: 'Vault execution',
          scope: 'resource',
        },
      ],
      // First-party external app handoff. The host suffix is already on the
      // iframe policy allowlist (.blueprint.tangle.tools), and curated entries
      // are trusted-by-default — no on-chain metadata attestation needed.
      externalApp: {
        url: 'https://trading-arena.blueprint.tangle.tools/',
        mode: 'iframe',
        host: 'trading-arena.blueprint.tangle.tools',
        trust: 'trusted',
        label: 'AI Trading',
      },
    },
    // Iframe runtime policy. No contracts/messages: the trading-arena UI
    // doesn't issue tangle.app.signTransaction yet, so we don't grant a
    // transaction surface. allowReadAccount surfaces the connected wallet for
    // read-only views (positions, balances). Chain switching IS allowed but
    // restricted to Base Sepolia (84532) — the chain the trading bots run on —
    // so the embedded arena can move a wrong-network wallet onto the right
    // chain without unlocking signing.
    iframe: {
      url: 'https://trading-arena.blueprint.tangle.tools/',
      origin: 'https://trading-arena.blueprint.tangle.tools',
      appId: 'trading-arena',
      allowedChainIds: [84532],
      contracts: [],
      messages: [],
      allowReadAccount: true,
      allowChainSwitch: true,
      allowPopups: false,
    },
  },
  {
    slug: 'sandbox',
    canonicalSlug: 'sandbox',
    match: {
      publisherNamespace: 'tangle',
      requestedSlug: 'ai-agent-sandbox',
    },
    publisher: {
      label: 'Tangle Labs',
      visibility: 'first-party',
      verification: 'first-party',
    },
    tier: 'curated-module',
    slugPolicy: 'reserved',
    // Sandbox is iframe-driven (agent-sandbox.blueprint.tangle.tools) — the
    // dapp used to ship a bespoke React module here; we deleted it in favor
    // of the iframe path so all per-blueprint customization lands in the
    // publisher's hosted app (or, increasingly, in declarative metadata that
    // the procedural landing component consumes).
    module: {
      moduleId: 'sandbox',
      status: 'planned',
    },
    manifest: {
      displayName: 'AI Agent Sandbox',
      tagline: 'Run agent sandboxes with terminal, chat, and tool access.',
      description:
        'Create a sandbox service, attach operators, inspect sessions, and manage agent resources.',
      surfaces: [
        'generic-overview',
        'service-explorer',
        'service-console',
        'actions-panel',
        'resources',
        'chat',
        'permissions',
      ],
      resources: {
        serviceNoun: 'sandbox service',
        resourceNoun: 'agent',
        resourceRoute: 'agents',
      },
      permissions: [
        {
          key: 'session.attach',
          label: 'Session attach',
          scope: 'resource',
        },
      ],
      externalApp: {
        url: 'https://agent-sandbox.blueprint.tangle.tools/',
        mode: 'iframe',
        host: 'agent-sandbox.blueprint.tangle.tools',
        trust: 'trusted',
        label: 'AI Agent Sandbox',
      },
    },
    iframe: {
      url: 'https://agent-sandbox.blueprint.tangle.tools/',
      origin: 'https://agent-sandbox.blueprint.tangle.tools',
      appId: 'agent-sandbox',
      allowedChainIds: [],
      contracts: [],
      messages: [],
      allowReadAccount: true,
      allowChainSwitch: false,
      allowPopups: false,
    },
  },
  {
    slug: 'training',
    canonicalSlug: 'training',
    match: {
      publisherNamespace: 'tangle',
      requestedSlug: 'distributed-training',
    },
    publisher: {
      label: 'Tangle Labs',
      visibility: 'first-party',
      verification: 'first-party',
    },
    tier: 'curated-module',
    slugPolicy: 'reserved',
    module: {
      moduleId: 'training',
      status: 'planned',
    },
    manifest: {
      displayName: 'AI Training',
      tagline: 'Create and monitor distributed training runs.',
      description:
        'Create a training service, select operators, configure the method, and track checkpoints.',
      surfaces: [
        'generic-overview',
        'service-explorer',
        'service-console',
        'actions-panel',
        'resources',
        'permissions',
        'metrics',
      ],
      resources: {
        serviceNoun: 'training service',
        resourceNoun: 'run',
        resourceRoute: 'runs',
      },
      permissions: [
        {
          key: 'dataset.manage',
          label: 'Dataset management',
          scope: 'resource',
        },
        {
          key: 'training.execute',
          label: 'Training execution',
          scope: 'service',
        },
      ],
    },
  },
  {
    slug: 'bazaar',
    canonicalSlug: 'bazaar',
    match: {
      publisherNamespace: 'tangle',
      requestedSlug: 'surplus',
    },
    publisher: {
      label: 'Tangle Labs',
      visibility: 'first-party',
      verification: 'first-party',
    },
    tier: 'curated-module',
    slugPolicy: 'reserved',
    module: {
      moduleId: 'surplus',
      status: 'planned',
    },
    manifest: {
      displayName: 'Inference Bazaar',
      tagline: 'Buy and sell prepaid AI inference credits.',
      description:
        'Open a surplus market venue, discover operators, inspect credit lots, and reconcile settlement batches for prepaid inference.',
      surfaces: [
        'generic-overview',
        'service-explorer',
        'service-console',
        'actions-panel',
        'resources',
        'permissions',
        'metrics',
      ],
      resources: {
        serviceNoun: 'surplus market',
        resourceNoun: 'venue',
        resourceRoute: 'custom',
      },
      permissions: [
        {
          key: 'market.make',
          label: 'Market making',
          scope: 'service',
        },
        {
          key: 'settlement.submit',
          label: 'Settlement submission',
          scope: 'service',
        },
        {
          key: 'credits.redeem',
          label: 'Credit redemption',
          scope: 'resource',
        },
      ],
      externalApp: {
        url: 'https://surplus-market.pages.dev/',
        mode: 'iframe',
        host: 'surplus-market.pages.dev',
        trust: 'trusted',
        label: 'Inference Bazaar',
      },
    },
    // Iframe runtime policy. Inference Bazaar runs its OWN wallet (ConnectKit) inside the
    // frame rather than the parent bridge, so the bridge grants stay off
    // (allowReadAccount/allowChainSwitch false, no contract/message grants).
    // allowPopups: wallet connect popups + explorer links. allowSameOrigin:
    // surplus-market.pages.dev is cross-origin, so this gives the app its own
    // storage (WalletConnect/ConnectKit need it) without any parent access.
    iframe: {
      url: 'https://surplus-market.pages.dev/',
      origin: 'https://surplus-market.pages.dev',
      appId: 'surplus',
      allowedChainIds: [84532],
      contracts: [],
      messages: [],
      allowReadAccount: false,
      allowChainSwitch: false,
      allowPopups: true,
      allowSameOrigin: true,
    },
  },
  {
    slug: 'llm-inference',
    canonicalSlug: 'llm-inference',
    match: {
      publisherNamespace: 'tangle',
      requestedSlug: 'llm-inference',
    },
    publisher: {
      label: 'Tangle Labs',
      visibility: 'first-party',
      verification: 'first-party',
    },
    tier: 'curated-module',
    slugPolicy: 'reserved',
    module: {
      moduleId: 'llm-inference',
      status: 'planned',
    },
    manifest: {
      displayName: 'LLM Inference',
      tagline: 'Anonymous, pay-per-use LLM inference from Tangle operators.',
      description:
        'Chat with vLLM-backed operator models, paying via shielded credits. Deposit once; each request is authorized off-chain by an ephemeral key, so the operator never learns who you are.',
      surfaces: [
        'generic-overview',
        'service-explorer',
        'service-console',
        'chat',
        'permissions',
      ],
      resources: {
        serviceNoun: 'inference service',
        resourceNoun: 'model',
        resourceRoute: 'custom',
      },
      permissions: [
        {
          key: 'credits.fund',
          label: 'Fund shielded credits',
          scope: 'service',
        },
      ],
      externalApp: {
        url: 'https://llm-inference.blueprint.tangle.tools/',
        mode: 'iframe',
        host: 'llm-inference.blueprint.tangle.tools',
        trust: 'trusted',
        label: 'LLM Inference',
      },
    },
    // Read surface only for now: the iframe inherits the connected wallet and
    // self-configures from the operator's /v1/operator (model, pricing,
    // shielded_credits, chain_id). Funding deposits (approve + fundCredits)
    // need `sendTransaction` allowlisted against the live develop
    // ShieldedCredits + payment-token addresses — added once the develop
    // operator + gateway are deployed (the spending-key SpendAuths are signed
    // inside the iframe and never touch the bridge).
    iframe: {
      url: 'https://llm-inference.blueprint.tangle.tools/',
      origin: 'https://llm-inference.blueprint.tangle.tools',
      appId: 'llm-inference',
      allowedChainIds: [],
      contracts: [],
      messages: [],
      allowReadAccount: true,
      allowChainSwitch: false,
      allowPopups: false,
    },
  },
] satisfies CuratedRegistryEntry[];

export const blueprintAppRegistry = new Map(
  entries.map((entry) => [entry.slug, entry]),
);
export const blueprintAppCanonicalRegistry = new Map(
  entries.map((entry) => [entry.canonicalSlug, entry]),
);

export const blueprintAppEntries = entries;

export const protocolGenericBlueprintExperience = resolveBlueprintAppView({
  slug: 'generic',
  canonicalSlug: 'generic',
  tier: 'generic',
  slugPolicy: 'public-requested',
  publisher: {
    label: 'Protocol',
    visibility: 'third-party',
    verification: 'verified',
  },
  manifest: {
    displayName: 'Blueprint service view',
    tagline: 'Default controls for indexed blueprints and services.',
    description:
      'Shows blueprint details, operators, service instances, permissions, and request forms when no custom app is configured.',
    surfaces: [
      'generic-overview',
      'service-explorer',
      'actions-panel',
      'permissions',
    ],
    resources: {
      serviceNoun: 'service',
      resourceNoun: 'resource',
      resourceRoute: 'custom',
    },
  },
});

export function getBlueprintAppBySlug(slug: string): BlueprintAppEntry | null {
  return blueprintAppRegistry.get(slug) ?? null;
}

export function getBlueprintAppByCanonicalSlug(
  canonicalSlug: string,
): BlueprintAppEntry | null {
  return (
    blueprintAppCanonicalRegistry.get(canonicalSlug) ??
    blueprintAppRegistry.get(canonicalSlug) ??
    null
  );
}

/**
 * Resolve a curated app entry from the blueprint's parsed metadata identity.
 * Walks the registry returning the first entry whose `match` clause aligns
 * with `(publisherNamespace, requestedSlug)`. Match fields are checked
 * case-insensitively; absent matcher fields are wildcards. Returns null when
 * no entry claims this blueprint (typical case — most blueprints render via
 * the generic + declarative path).
 *
 * Matching on declared identity (not chain id) means re-registering a
 * curated app on a new chain or after a redeploy doesn't break dapp
 * routing: as long as the blueprint's metadata still declares the same
 * `publisher.namespace` + `requestedSlug`, the curated module renders.
 */
export function getBlueprintAppForMetadata(identity: {
  publisherNamespace?: string | null;
  requestedSlug?: string | null;
}): BlueprintAppEntry | null {
  const namespace = identity.publisherNamespace?.toLowerCase() ?? '';
  const slug = identity.requestedSlug?.toLowerCase() ?? '';
  for (const entry of entries) {
    const m = entry.match;
    if (!m) continue;
    if (
      m.publisherNamespace &&
      m.publisherNamespace.toLowerCase() !== namespace
    ) {
      continue;
    }
    if (m.requestedSlug && m.requestedSlug.toLowerCase() !== slug) {
      continue;
    }
    return entry;
  }
  return null;
}

export function isBlueprintAppSlug(slug: string): boolean {
  return blueprintAppRegistry.has(slug);
}

export function isLegacyBlueprintIdParam(value: string): boolean {
  return /^\d+$/.test(value);
}

import { resolveBlueprintAppView } from './resolver';
import type { BlueprintAppEntry } from './types';

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

type CuratedRegistryEntry = BlueprintAppEntry & {
  match?: CuratedBlueprintMatcher;
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
    module: {
      moduleId: 'sandbox',
      status: 'active',
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

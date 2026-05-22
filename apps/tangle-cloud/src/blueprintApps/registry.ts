import { resolveBlueprintAppView } from './resolver';
import type { BlueprintAppEntry } from './types';

/**
 * Per-network blueprintId → curated-entry slug bindings.
 *
 * The upstream `BlueprintAppEntry` type only carries a single `blueprintId`,
 * but in practice one curated app (e.g. the sandbox) maps to multiple
 * on-chain IDs across networks and across retries (Base Sepolia currently
 * has the sandbox registered at ids 0, 1, and 2). This map is the single
 * source of truth for those bindings — `getBlueprintAppByBlueprintId`
 * consults it first.
 *
 * Update this when:
 *   - re-registering a curated app on a new network
 *   - landing a brand new curated entry that ships with a known id
 */
const CURATED_BLUEPRINT_ID_TO_SLUG: ReadonlyMap<bigint, string> = new Map([
  // Base Sepolia (chainId 84532) — see deployments/base-sepolia/blueprints.tsv
  [0n, 'sandbox'],
  [1n, 'sandbox'],
  [2n, 'sandbox'],
]);

const entries = [
  {
    slug: 'trading',
    canonicalSlug: 'trading',
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
] satisfies BlueprintAppEntry[];

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

export function getBlueprintAppByBlueprintId(
  blueprintId: bigint,
): BlueprintAppEntry | null {
  const mappedSlug = CURATED_BLUEPRINT_ID_TO_SLUG.get(blueprintId);
  if (mappedSlug) {
    const mapped = blueprintAppRegistry.get(mappedSlug);
    if (mapped) {
      return mapped;
    }
  }

  return null;
}

export function isBlueprintAppSlug(slug: string): boolean {
  return blueprintAppRegistry.has(slug);
}

export function isLegacyBlueprintIdParam(value: string): boolean {
  return /^\d+$/.test(value);
}

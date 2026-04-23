import { resolveBlueprintAppView } from './resolver';
import type { BlueprintAppEntry } from './types';

const entries = [
  {
    slug: 'trading',
    canonicalSlug: 'trading',
    blueprintId: 1n,
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
      displayName: 'AI Trading Arena',
      tagline: 'Deploy, monitor, and operate autonomous trading agents.',
      description:
        'Provision strategy-driven trading agents, explore live service instances, and expose operator-backed trading surfaces through one shared shell.',
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
      tagline:
        'Run durable agent sandboxes with chat, terminal, and tool surfaces.',
      description:
        'Launch interactive agent environments, inspect running sessions, and expose per-service sandboxes and agent resources from a common blueprint app host.',
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
      displayName: 'AI Training Studio',
      tagline:
        'Train, evaluate, and operate persistent AI training workflows on Tangle.',
      description:
        'Launch training services, review datasets and evaluation runs, and expose model-improvement workflows through the same blueprint host shell used by every other first-party app.',
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
    displayName: 'Protocol-native blueprint UI',
    tagline: 'Renderable fallback for any onchain blueprint and service.',
    description:
      'Tangle Cloud should always be able to show a blueprint overview, service instances, permissions, operators, and generic interactions even when no custom blueprint app exists.',
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
  for (const entry of blueprintAppEntries) {
    if (entry.blueprintId === blueprintId) {
      return entry;
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

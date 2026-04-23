import type { Blueprint as IndexedBlueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import type { BlueprintWithMetadata } from '@tangle-network/tangle-shared-ui/data/graphql';
import type {
  BlueprintAppEntry,
  BlueprintExternalAppConfig,
  BlueprintPermissionDescriptor,
  BlueprintPermissionScope,
  BlueprintPublisher,
  BlueprintResourceModel,
  BlueprintResourceRoute,
  BlueprintUiManifest,
  BlueprintUiSurface,
} from './types';
import {
  buildCanonicalBlueprintSlug,
  canPublisherClaimSlug,
  deriveBlueprintRequestedSlug,
  isTrustedExternalAppHost,
  sanitizeBlueprintSlugPart,
} from './resolver';
import { getPublisherVerificationForNamespace } from './policy';

const SURFACE_VALUES = new Set<BlueprintUiSurface>([
  'generic-overview',
  'service-explorer',
  'service-console',
  'actions-panel',
  'resources',
  'chat',
  'vaults',
  'metrics',
  'permissions',
]);

const RESOURCE_ROUTE_VALUES = new Set<BlueprintResourceRoute>([
  'bots',
  'agents',
  'runs',
  'vault',
  'chat',
  'custom',
]);

const PERMISSION_SCOPE_VALUES = new Set<BlueprintPermissionScope>([
  'blueprint',
  'service',
  'resource',
]);

const EXTERNAL_APP_MODE_VALUES = new Set(['link', 'iframe']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const readRecord = (value: unknown): Record<string, unknown> | null =>
  isRecord(value) ? value : null;

const readStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? (value.map(readString).filter(Boolean) as string[])
    : [];

function pickManifestRoot(
  rawMetadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!rawMetadata) {
    return null;
  }

  const candidates = [
    readRecord(rawMetadata.blueprintUi),
    readRecord(rawMetadata.blueprint_ui),
    readRecord(rawMetadata.tangleCloud),
    readRecord(readRecord(rawMetadata.cloud)?.blueprint),
    readRecord(rawMetadata.app),
  ];

  return candidates.find(Boolean) ?? null;
}

function parseSurfaces(
  value: unknown,
  fallback: BlueprintUiSurface[],
): BlueprintUiSurface[] {
  const requested = readStringArray(value).filter(
    (item): item is BlueprintUiSurface =>
      SURFACE_VALUES.has(item as BlueprintUiSurface),
  );

  return requested.length > 0 ? requested : fallback;
}

function parseResourceModel(
  value: unknown,
  fallback: BlueprintResourceModel,
): BlueprintResourceModel {
  const record = readRecord(value);
  if (!record) {
    return fallback;
  }

  const serviceNoun = readString(record.serviceNoun) ?? fallback.serviceNoun;
  const resourceNoun = readString(record.resourceNoun) ?? fallback.resourceNoun;
  const resourceRoute = readString(record.resourceRoute);

  return {
    serviceNoun,
    resourceNoun,
    resourceRoute:
      resourceRoute &&
      RESOURCE_ROUTE_VALUES.has(resourceRoute as BlueprintResourceRoute)
        ? (resourceRoute as BlueprintResourceRoute)
        : fallback.resourceRoute,
  };
}

function parsePermissions(
  value: unknown,
): BlueprintPermissionDescriptor[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const permissions = value
    .map((item) => {
      const record = readRecord(item);
      if (!record) {
        return null;
      }

      const key = readString(record.key);
      const label = readString(record.label);
      const scope = readString(record.scope);

      if (
        !key ||
        !label ||
        !scope ||
        !PERMISSION_SCOPE_VALUES.has(scope as BlueprintPermissionScope)
      ) {
        return null;
      }

      return {
        key,
        label,
        scope: scope as BlueprintPermissionScope,
        description: readString(record.description) ?? undefined,
      } satisfies BlueprintPermissionDescriptor;
    })
    .filter(Boolean) as BlueprintPermissionDescriptor[];

  return permissions.length > 0 ? permissions : undefined;
}

function parseExternalApp(
  value: unknown,
): BlueprintExternalAppConfig | undefined {
  const record = readRecord(value);
  if (!record) {
    return undefined;
  }

  const url = readString(record.url);
  const mode = readString(record.mode);

  if (
    !url ||
    !mode ||
    !EXTERNAL_APP_MODE_VALUES.has(mode) ||
    !/^https:\/\//.test(url)
  ) {
    return undefined;
  }

  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return undefined;
  }

  const trust = isTrustedExternalAppHost(host) ? 'trusted' : 'restricted';

  return {
    url,
    mode: mode as BlueprintExternalAppConfig['mode'],
    label: readString(record.label) ?? undefined,
    host,
    trust,
    ...(trust === 'restricted'
      ? {
          reason:
            'External app host is not on the trusted Tangle allowlist yet.',
        }
      : {}),
  };
}

export function buildBlueprintManifestFromMetadata(
  blueprint: BlueprintWithMetadata,
): {
  entry: BlueprintAppEntry;
  source: 'generic' | 'metadata';
} {
  const baseSurfaces: BlueprintUiSurface[] = [
    'generic-overview',
    'service-explorer',
    'actions-panel',
    'permissions',
  ];

  const baseManifest: BlueprintUiManifest = {
    displayName: blueprint.name,
    tagline:
      blueprint.category !== null
        ? `${blueprint.category} blueprint`
        : 'Protocol-indexed blueprint',
    description:
      blueprint.description ??
      'No custom blueprint app manifest is available yet. Tangle Cloud is rendering the protocol-native fallback UI for this blueprint.',
    surfaces: baseSurfaces,
    resources: {
      serviceNoun: 'service',
      resourceNoun: 'resource',
      resourceRoute: 'custom',
    },
  };

  const manifestRoot = pickManifestRoot(blueprint.rawMetadata);
  const publisherNamespace =
    readString(readRecord(manifestRoot?.publisher)?.namespace) ??
    sanitizeBlueprintSlugPart(blueprint.author);
  const publisherVerified =
    readString(readRecord(manifestRoot?.publisher)?.verification) ===
    'verified';
  const requestedSlug =
    readString(manifestRoot?.slug) ??
    deriveBlueprintRequestedSlug({
      id: blueprint.blueprintId,
      name: blueprint.name,
      author: blueprint.author,
    });
  const normalizedRequestedSlug = sanitizeBlueprintSlugPart(requestedSlug);
  const publisher: BlueprintPublisher = {
    label: blueprint.author || 'Unknown publisher',
    namespace: publisherNamespace || undefined,
    visibility: 'third-party',
    verification: publisherVerified
      ? 'verified'
      : getPublisherVerificationForNamespace(publisherNamespace),
  };
  const slugPolicy = canPublisherClaimSlug(normalizedRequestedSlug, publisher)
    ? 'publisher-scoped'
    : 'public-requested';

  const manifest: BlueprintUiManifest = {
    displayName:
      readString(manifestRoot?.displayName) ?? baseManifest.displayName,
    tagline: readString(manifestRoot?.tagline) ?? baseManifest.tagline,
    description:
      readString(manifestRoot?.description) ?? baseManifest.description,
    surfaces: parseSurfaces(manifestRoot?.surfaces, baseManifest.surfaces),
    resources: parseResourceModel(
      manifestRoot?.resources,
      baseManifest.resources,
    ),
    permissions: parsePermissions(manifestRoot?.permissions),
    externalApp: parseExternalApp(manifestRoot?.externalApp),
  };

  const entry: BlueprintAppEntry = {
    slug: normalizedRequestedSlug,
    canonicalSlug: normalizedRequestedSlug,
    blueprintId: blueprint.blueprintId,
    publisher,
    tier: manifest.externalApp
      ? 'external-app'
      : manifestRoot
        ? 'declarative'
        : 'generic',
    slugPolicy,
    manifest,
  };

  entry.canonicalSlug = buildCanonicalBlueprintSlug(entry);

  return {
    entry,
    source: manifestRoot ? 'metadata' : 'generic',
  };
}

export function buildGenericBlueprintAppEntry(
  blueprint: IndexedBlueprint,
): BlueprintAppEntry {
  const requestedSlug = deriveBlueprintRequestedSlug(blueprint);

  return {
    slug: requestedSlug,
    canonicalSlug: requestedSlug,
    blueprintId: blueprint.id,
    publisher: {
      label: blueprint.author || 'Unknown publisher',
      namespace: sanitizeBlueprintSlugPart(blueprint.author || ''),
      visibility: 'third-party',
      verification: getPublisherVerificationForNamespace(
        sanitizeBlueprintSlugPart(blueprint.author || ''),
      ),
    },
    tier: 'generic',
    slugPolicy: 'public-requested',
    manifest: {
      displayName: blueprint.name,
      tagline:
        blueprint.category !== null
          ? `${blueprint.category} blueprint`
          : 'Protocol-indexed blueprint',
      description:
        blueprint.description ??
        'No custom blueprint app manifest is available yet. Tangle Cloud is rendering the protocol-native fallback UI for this blueprint.',
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
  };
}

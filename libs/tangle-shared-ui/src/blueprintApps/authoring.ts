import type {
  BlueprintResourceRoute,
  BlueprintUiAuthoringDraft,
  BlueprintUiContract,
  BlueprintUiExternalApp,
  BlueprintUiExternalAppMode,
  BlueprintUiPublisher,
  BlueprintUiSurface,
  ParsedBlueprintMetadata,
} from './types';

const DEFAULT_SURFACES: BlueprintUiSurface[] = [
  'generic-overview',
  'service-explorer',
  'actions-panel',
  'resources',
  'metrics',
];

const SURFACE_FLAG_MAP: Record<string, BlueprintUiSurface> = {
  genericOverview: 'generic-overview',
  serviceExplorer: 'service-explorer',
  serviceConsole: 'service-console',
  actionsPanel: 'actions-panel',
  resources: 'resources',
  chat: 'chat',
  vaults: 'vaults',
  metrics: 'metrics',
  permissions: 'permissions',
};

const RESOURCE_ROUTE_VALUES: BlueprintResourceRoute[] = [
  'bots',
  'agents',
  'runs',
  'vault',
  'chat',
  'custom',
];

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

const EXTERNAL_APP_MODE_VALUES = new Set<BlueprintUiExternalAppMode>([
  'link',
  'iframe',
]);

export const DEFAULT_BLUEPRINT_UI_DRAFT: BlueprintUiAuthoringDraft = {
  requestedSlug: '',
  publisherNamespace: '',
  serviceNoun: 'Service',
  resourceNoun: 'Resource',
  resourceRoute: 'custom',
  surfaces: DEFAULT_SURFACES,
  externalAppUrl: '',
  externalAppMode: 'link',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readNullableString = (value: unknown): string | null => {
  const trimmed = readTrimmedString(value);
  return trimmed ?? null;
};

const isValidHttpUrl = (value: string | undefined): value is string => {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const sanitizeBlueprintSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const normalizeResourceRoute = (value: unknown): BlueprintResourceRoute => {
  const route = readTrimmedString(value)?.toLowerCase();
  if (
    route &&
    RESOURCE_ROUTE_VALUES.includes(route as BlueprintResourceRoute)
  ) {
    return route as BlueprintResourceRoute;
  }

  return 'custom';
};

const normalizeSurfaces = (value: unknown): BlueprintUiSurface[] => {
  if (Array.isArray(value)) {
    const surfaces = value.filter(
      (entry): entry is BlueprintUiSurface =>
        typeof entry === 'string' &&
        SURFACE_VALUES.has(entry as BlueprintUiSurface),
    );

    return Array.from(new Set(surfaces));
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(SURFACE_FLAG_MAP).flatMap(([key, surface]) =>
    value[key] === true ? [surface] : [],
  );
};

const buildCanonicalSlug = (
  requestedSlug: string | undefined,
  publisher: Pick<BlueprintUiPublisher, 'namespace'>,
): string | undefined => {
  if (!requestedSlug) {
    return undefined;
  }

  if (publisher.namespace) {
    return `@${publisher.namespace}/${requestedSlug}`;
  }

  return requestedSlug;
};

const normalizeExternalApp = (
  value: unknown,
): BlueprintUiExternalApp | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const url = readTrimmedString(value.url);
  if (!isValidHttpUrl(url)) {
    return undefined;
  }

  const mode = readTrimmedString(value.mode)?.toLowerCase();
  return {
    url,
    mode: EXTERNAL_APP_MODE_VALUES.has(mode as BlueprintUiExternalAppMode)
      ? (mode as BlueprintUiExternalAppMode)
      : 'link',
  };
};

export const parseBlueprintUiContract = (
  value: unknown,
  fallback?: {
    name?: string;
    description?: string;
    author?: string;
  },
): BlueprintUiContract | null => {
  if (!isRecord(value)) {
    return null;
  }

  const publisherValue = isRecord(value.publisher) ? value.publisher : {};
  const publisher: BlueprintUiPublisher = {
    name:
      readTrimmedString(publisherValue.name) ??
      fallback?.author ??
      'Unknown publisher',
    namespace: readTrimmedString(publisherValue.namespace),
    verified:
      publisherValue.verified === true ||
      publisherValue.verification === 'verified' ||
      publisherValue.verification === 'first-party',
  };

  const requestedSlug = sanitizeBlueprintSlug(
    readTrimmedString(value.requestedSlug) ?? '',
  );

  const resourcesValue = isRecord(value.resources) ? value.resources : {};
  const surfaces = normalizeSurfaces(value.surfaces);
  const externalApp = normalizeExternalApp(value.externalApp);

  return {
    displayName:
      readTrimmedString(value.displayName) ??
      fallback?.name ??
      'Unknown Blueprint',
    description:
      readTrimmedString(value.description) ??
      fallback?.description ??
      'No shared host metadata available yet.',
    requestedSlug: requestedSlug || undefined,
    canonicalSlug: buildCanonicalSlug(requestedSlug || undefined, publisher),
    publisher,
    resources: {
      serviceLabel: readTrimmedString(resourcesValue.serviceLabel) ?? 'Service',
      itemLabel: readTrimmedString(resourcesValue.itemLabel) ?? 'Resource',
      itemRoute: normalizeResourceRoute(resourcesValue.itemRoute),
    },
    surfaces,
    externalApp,
    tier:
      externalApp !== undefined
        ? 'link-out'
        : surfaces.length > 0
          ? 'declarative'
          : 'generic',
  };
};

export const parseBlueprintMetadataDocument = (
  value: unknown,
): ParsedBlueprintMetadata => {
  if (!isRecord(value)) {
    return {
      name: 'Unknown Blueprint',
      description: 'Failed to load metadata',
      author: 'Unknown',
      category: 'Other',
      imageUrl: null,
      codeUrl: null,
      website: null,
      blueprintUi: null,
    };
  }

  const name = readTrimmedString(value.name) ?? 'Unknown Blueprint';
  const description =
    readTrimmedString(value.description) ?? 'No description available';
  const author = readTrimmedString(value.author) ?? 'Unknown';

  return {
    name,
    description,
    author,
    category: readTrimmedString(value.category) ?? 'Other',
    imageUrl:
      readNullableString(value.image) ??
      readNullableString(value.imageUrl) ??
      readNullableString(value.logo),
    codeUrl:
      readNullableString(value.codeUrl) ??
      readNullableString(value.codeRepository) ??
      readNullableString(value.repository),
    website:
      readNullableString(value.website) ?? readNullableString(value.homepage),
    blueprintUi: parseBlueprintUiContract(value.blueprintUi, {
      name,
      description,
      author,
    }),
  };
};

export const buildBlueprintUiMetadataDocument = ({
  name,
  description,
  category,
  codeRepository,
  logo,
  website,
  author,
  draft,
}: {
  name: string;
  description: string;
  category: string;
  codeRepository: string;
  logo: string;
  website: string;
  author: string;
  draft: BlueprintUiAuthoringDraft;
}) => {
  const requestedSlug =
    sanitizeBlueprintSlug(draft.requestedSlug) || sanitizeBlueprintSlug(name);

  return {
    name,
    description,
    author,
    category,
    image: readTrimmedString(logo) ?? null,
    logo: readTrimmedString(logo) ?? null,
    website: readTrimmedString(website) ?? null,
    codeRepository: readTrimmedString(codeRepository) ?? null,
    blueprintUi: {
      displayName: readTrimmedString(name) ?? 'Unnamed Blueprint',
      description:
        readTrimmedString(description) ??
        'Third-party blueprint hosted through the shared Tangle Cloud runtime.',
      requestedSlug: requestedSlug || undefined,
      publisher: {
        name: readTrimmedString(author) ?? 'Unknown publisher',
        namespace: readTrimmedString(draft.publisherNamespace),
        verified: false,
      },
      resources: {
        serviceLabel: readTrimmedString(draft.serviceNoun) ?? 'Service',
        itemLabel: readTrimmedString(draft.resourceNoun) ?? 'Resource',
        itemRoute: draft.resourceRoute,
      },
      surfaces: {
        genericOverview: draft.surfaces.includes('generic-overview'),
        serviceExplorer: draft.surfaces.includes('service-explorer'),
        serviceConsole: draft.surfaces.includes('service-console'),
        actionsPanel: draft.surfaces.includes('actions-panel'),
        resources: draft.surfaces.includes('resources'),
        chat: draft.surfaces.includes('chat'),
        vaults: draft.surfaces.includes('vaults'),
        metrics: draft.surfaces.includes('metrics'),
        permissions: draft.surfaces.includes('permissions'),
      },
      externalApp: isValidHttpUrl(readTrimmedString(draft.externalAppUrl))
        ? {
            url: draft.externalAppUrl.trim(),
            mode: draft.externalAppMode,
          }
        : undefined,
    },
  };
};

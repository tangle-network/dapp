import {
  getAddress,
  isAddressEqual,
  keccak256,
  toHex,
  verifyMessage,
  type Address,
  type Hex,
} from 'viem';
import { isAllowedBlueprintMetadataUri } from './metadataUri';
import type {
  BlueprintMetadataAttestation,
  BlueprintMetadataAttestationMode,
  BlueprintMetadataVerification,
  BlueprintMode,
  BlueprintResourceRoute,
  BlueprintUiAction,
  BlueprintUiActionField,
  BlueprintUiActionFieldInput,
  BlueprintUiActionTarget,
  BlueprintUiAuthoringDraft,
  BlueprintUiCardKind,
  BlueprintUiCardTone,
  BlueprintUiContract,
  BlueprintUiExternalApp,
  BlueprintUiExternalAppMode,
  BlueprintUiModuleBinding,
  BlueprintUiModuleKey,
  BlueprintUiModuleSlot,
  BlueprintUiOverviewCard,
  BlueprintUiPublisher,
  BlueprintUiResourceView,
  BlueprintUiResourceViewKind,
  BlueprintUiResourceViewTarget,
  BlueprintUiSurface,
  BlueprintUiTheme,
  BlueprintUiThemeIcon,
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

const THEME_ICON_VALUES = new Set<BlueprintUiThemeIcon>([
  'bot',
  'shield',
  'graph',
  'spark',
]);

const CARD_KIND_VALUES = new Set<BlueprintUiCardKind>([
  'stat',
  'callout',
  'links',
  'checklist',
]);

const CARD_TONE_VALUES = new Set<BlueprintUiCardTone>([
  'neutral',
  'info',
  'success',
  'warning',
]);

const ACTION_FIELD_INPUT_VALUES = new Set<BlueprintUiActionFieldInput>([
  'text',
  'textarea',
  'number',
  'select',
  'toggle',
]);

const ACTION_TARGET_VALUES = new Set<BlueprintUiActionTarget>([
  'blueprint',
  'service',
  'resource',
]);

const RESOURCE_VIEW_KIND_VALUES = new Set<BlueprintUiResourceViewKind>([
  'table',
  'grid',
  'timeline',
]);

const RESOURCE_VIEW_TARGET_VALUES = new Set<BlueprintUiResourceViewTarget>([
  'service',
  'resource',
]);

const MODULE_KEY_VALUES = new Set<BlueprintUiModuleKey>([
  'metrics-overview',
  'service-health',
  'resource-events',
  'permissions-matrix',
  'activity-feed',
]);

const MODULE_SLOT_VALUES = new Set<BlueprintUiModuleSlot>([
  'overview',
  'sidebar',
  'actions',
  'resources',
]);

const COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const MAX_METADATA_BYTES = 64 * 1024;
const MAX_STRING_LENGTH = 240;
const MAX_DESCRIPTION_LENGTH = 1_200;
const MAX_CARD_COUNT = 8;
const MAX_CARD_LINK_COUNT = 5;
const MAX_CARD_ITEM_COUNT = 6;
const MAX_ACTION_COUNT = 8;
const MAX_ACTION_FIELD_COUNT = 12;
const MAX_OPTION_COUNT = 8;
const MAX_RESOURCE_VIEW_COUNT = 6;
const MAX_RESOURCE_COLUMN_COUNT = 8;
const MAX_MODULE_COUNT = 8;
const MAX_STRING_LIST_COUNT = 8;
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

const readTrimmedString = (
  value: unknown,
  maxLength = MAX_STRING_LENGTH,
): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, maxLength);
};

const readStringArray = (
  value: unknown,
  maxItems = MAX_STRING_LIST_COUNT,
  maxLength = MAX_STRING_LENGTH,
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => readTrimmedString(entry, maxLength))
    .filter(Boolean)
    .slice(0, maxItems) as string[];
};

const readColor = (value: unknown): string | undefined => {
  const color = readTrimmedString(value, 16);
  return color && COLOR_PATTERN.test(color) ? color : undefined;
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

const isValidHttpsUrl = (value: string | undefined): value is string => {
  if (!value) {
    return false;
  }

  try {
    return new URL(value).protocol === 'https:';
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
  const route = readTrimmedString(value, 32)?.toLowerCase();
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

  const url = readTrimmedString(value.url, 2_048);
  if (!isValidHttpsUrl(url)) {
    return undefined;
  }

  const mode = readTrimmedString(value.mode, 16)?.toLowerCase();
  return {
    url,
    // Third-party iframe embedding is disabled; safe handoff is link-out only.
    mode:
      mode === 'link' &&
      EXTERNAL_APP_MODE_VALUES.has(mode as BlueprintUiExternalAppMode)
        ? 'link'
        : 'link',
  };
};

const parseTheme = (value: unknown): BlueprintUiTheme | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const theme: BlueprintUiTheme = {
    accentColor: readColor(value.accentColor),
    secondaryColor: readColor(value.secondaryColor),
    badgeLabel: readTrimmedString(value.badgeLabel, 80),
  };

  const icon = readTrimmedString(value.icon, 24)?.toLowerCase();
  if (icon && THEME_ICON_VALUES.has(icon as BlueprintUiThemeIcon)) {
    theme.icon = icon as BlueprintUiThemeIcon;
  }

  return Object.keys(theme).length > 0 ? theme : undefined;
};

const parseOverviewCards = (
  value: unknown,
): BlueprintUiOverviewCard[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const cards = value.slice(0, MAX_CARD_COUNT).flatMap((entry, index) => {
    if (!isRecord(entry)) {
      return [];
    }

    const title = readTrimmedString(entry.title, 80);
    const kind = readTrimmedString(entry.kind, 32)?.toLowerCase();
    if (!title || !kind || !CARD_KIND_VALUES.has(kind as BlueprintUiCardKind)) {
      return [];
    }

    const tone = readTrimmedString(entry.tone, 24)?.toLowerCase();
    const links = Array.isArray(entry.links)
      ? entry.links.slice(0, MAX_CARD_LINK_COUNT).flatMap((link) => {
          if (!isRecord(link)) {
            return [];
          }

          const label = readTrimmedString(link.label, 60);
          const href = readTrimmedString(link.href, 2_048);
          if (!label || !isValidHttpsUrl(href)) {
            return [];
          }

          return [{ label, href }];
        })
      : undefined;
    const items = readStringArray(entry.items, MAX_CARD_ITEM_COUNT, 120);

    return [
      {
        id:
          sanitizeBlueprintSlug(readTrimmedString(entry.id, 60) ?? '') ||
          `card-${index + 1}`,
        kind: kind as BlueprintUiCardKind,
        title,
        description: readTrimmedString(entry.description, 240),
        value: readTrimmedString(entry.value, 80),
        tone: CARD_TONE_VALUES.has(tone as BlueprintUiCardTone)
          ? (tone as BlueprintUiCardTone)
          : undefined,
        ...(links && links.length > 0 ? { links } : {}),
        ...(items.length > 0 ? { items } : {}),
      } satisfies BlueprintUiOverviewCard,
    ];
  });

  return cards.length > 0 ? cards : undefined;
};

const parseActionFields = (
  value: unknown,
): BlueprintUiActionField[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const fields = value.slice(0, MAX_ACTION_FIELD_COUNT).flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }

    const key = sanitizeBlueprintSlug(
      readTrimmedString(entry.key, 60) ?? '',
    ).replace(/-/g, '_');
    const label = readTrimmedString(entry.label, 80);
    const input = readTrimmedString(entry.input, 24)?.toLowerCase();

    if (
      !key ||
      !label ||
      !input ||
      !ACTION_FIELD_INPUT_VALUES.has(input as BlueprintUiActionFieldInput)
    ) {
      return [];
    }

    const options = Array.isArray(entry.options)
      ? entry.options.slice(0, MAX_OPTION_COUNT).flatMap((option) => {
          if (!isRecord(option)) {
            return [];
          }

          const optionLabel = readTrimmedString(option.label, 60);
          const optionValue = readTrimmedString(option.value, 60);
          if (!optionLabel || !optionValue) {
            return [];
          }

          return [{ label: optionLabel, value: optionValue }];
        })
      : undefined;

    return [
      {
        key,
        label,
        input: input as BlueprintUiActionFieldInput,
        required: entry.required === true,
        placeholder: readTrimmedString(entry.placeholder, 120),
        helpText: readTrimmedString(entry.helpText, 160),
        ...(options && options.length > 0 ? { options } : {}),
      } satisfies BlueprintUiActionField,
    ];
  });

  return fields.length > 0 ? fields : undefined;
};

const parseActions = (value: unknown): BlueprintUiAction[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const actions = value.slice(0, MAX_ACTION_COUNT).flatMap((entry, index) => {
    if (!isRecord(entry)) {
      return [];
    }

    const label = readTrimmedString(entry.label, 80);
    const target = readTrimmedString(entry.target, 24)?.toLowerCase();
    if (
      !label ||
      !target ||
      !ACTION_TARGET_VALUES.has(target as BlueprintUiActionTarget)
    ) {
      return [];
    }

    const href = readTrimmedString(entry.href, 2_048);
    const fields = parseActionFields(entry.fields);

    if (!fields && !isValidHttpsUrl(href)) {
      return [];
    }

    return [
      {
        id:
          sanitizeBlueprintSlug(readTrimmedString(entry.id, 60) ?? '') ||
          `action-${index + 1}`,
        label,
        description: readTrimmedString(entry.description, 240),
        target: target as BlueprintUiActionTarget,
        submitLabel: readTrimmedString(entry.submitLabel, 60),
        ...(isValidHttpsUrl(href) ? { href } : {}),
        ...(fields ? { fields } : {}),
      } satisfies BlueprintUiAction,
    ];
  });

  return actions.length > 0 ? actions : undefined;
};

const parseResourceViews = (
  value: unknown,
): BlueprintUiResourceView[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const views = value
    .slice(0, MAX_RESOURCE_VIEW_COUNT)
    .flatMap((entry, index) => {
      if (!isRecord(entry)) {
        return [];
      }

      const title = readTrimmedString(entry.title, 80);
      const kind = readTrimmedString(entry.kind, 24)?.toLowerCase();
      const target = readTrimmedString(entry.target, 24)?.toLowerCase();
      if (
        !title ||
        !kind ||
        !target ||
        !RESOURCE_VIEW_KIND_VALUES.has(kind as BlueprintUiResourceViewKind) ||
        !RESOURCE_VIEW_TARGET_VALUES.has(
          target as BlueprintUiResourceViewTarget,
        )
      ) {
        return [];
      }

      const columns = Array.isArray(entry.columns)
        ? entry.columns
            .slice(0, MAX_RESOURCE_COLUMN_COUNT)
            .flatMap((column) => {
              if (!isRecord(column)) {
                return [];
              }

              const key = sanitizeBlueprintSlug(
                readTrimmedString(column.key, 60) ?? '',
              ).replace(/-/g, '_');
              const label = readTrimmedString(column.label, 60);

              if (!key || !label) {
                return [];
              }

              return [
                {
                  key,
                  label,
                  emphasis: column.emphasis === true,
                },
              ];
            })
        : [];

      if (columns.length === 0) {
        return [];
      }

      return [
        {
          id:
            sanitizeBlueprintSlug(readTrimmedString(entry.id, 60) ?? '') ||
            `view-${index + 1}`,
          title,
          kind: kind as BlueprintUiResourceViewKind,
          target: target as BlueprintUiResourceViewTarget,
          defaultSort: readTrimmedString(entry.defaultSort, 60),
          columns,
        } satisfies BlueprintUiResourceView,
      ];
    });

  return views.length > 0 ? views : undefined;
};

const MAX_MODE_COUNT = 8;
const MAX_MODE_ID_LENGTH = 48;

// Strict id pattern: lower-kebab, no whitespace, no special chars. The id
// ships into the iframe URL (`?mode=<id>`) so it has to be a stable, URL-
// safe token. Empty / over-length / invalid-char strings are rejected
// outright — partial sanitization would silently mutate publisher intent.
const MODE_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

const parseBlueprintModes = (
  value: unknown,
): BlueprintMode[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const seenIds = new Set<string>();
  const modes = value.slice(0, MAX_MODE_COUNT).flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }

    const id = readTrimmedString(entry.id, MAX_MODE_ID_LENGTH);
    const label = readTrimmedString(entry.label, 60);
    const rawBlueprintId = entry.blueprintId;
    const blueprintId =
      typeof rawBlueprintId === 'number'
        ? rawBlueprintId
        : typeof rawBlueprintId === 'string' && /^\d+$/.test(rawBlueprintId)
          ? Number(rawBlueprintId)
          : NaN;

    if (
      !id ||
      !label ||
      !MODE_ID_PATTERN.test(id) ||
      !Number.isInteger(blueprintId) ||
      blueprintId <= 0 ||
      seenIds.has(id)
    ) {
      return [];
    }

    seenIds.add(id);

    return [
      {
        id,
        label,
        blueprintId,
        description: readTrimmedString(entry.description, 240),
        tagline: readTrimmedString(entry.tagline, 60),
      } satisfies BlueprintMode,
    ];
  });

  return modes.length > 0 ? modes : undefined;
};

const parseModules = (
  value: unknown,
): BlueprintUiModuleBinding[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const modules = value
    .slice(0, MAX_MODULE_COUNT)
    .flatMap((entry) => {
      if (!isRecord(entry)) {
        return [];
      }

      const moduleKey = readTrimmedString(entry.module, 40)?.toLowerCase();
      const slot = readTrimmedString(entry.slot, 24)?.toLowerCase();
      if (
        !moduleKey ||
        !slot ||
        !MODULE_KEY_VALUES.has(moduleKey as BlueprintUiModuleKey) ||
        !MODULE_SLOT_VALUES.has(slot as BlueprintUiModuleSlot)
      ) {
        return [];
      }

      return [
        {
          module: moduleKey as BlueprintUiModuleKey,
          slot: slot as BlueprintUiModuleSlot,
          title: readTrimmedString(entry.title, 80),
          metricKeys: readStringArray(
            entry.metricKeys,
            MAX_STRING_LIST_COUNT,
            48,
          ),
          eventKinds: readStringArray(
            entry.eventKinds,
            MAX_STRING_LIST_COUNT,
            48,
          ),
        } satisfies BlueprintUiModuleBinding,
      ];
    })
    .map((module) => ({
      ...module,
      ...(module.metricKeys.length > 0 ? {} : { metricKeys: undefined }),
      ...(module.eventKinds.length > 0 ? {} : { eventKinds: undefined }),
    }));

  return modules.length > 0 ? modules : undefined;
};

const sanitizePublicUrl = (
  value: unknown,
  options?: { allowIpfs?: boolean },
): string | null => {
  const raw = readTrimmedString(value, 2_048);
  if (!raw) {
    return null;
  }

  if (options?.allowIpfs === true && raw.startsWith('ipfs://')) {
    return raw;
  }

  return isValidHttpUrl(raw) ? raw : null;
};

const toMetadataSource = (
  metadataUri: string | null | undefined,
): BlueprintMetadataVerification['source'] => {
  if (!metadataUri) return 'missing';
  if (metadataUri.startsWith('ipfs://')) return 'ipfs';
  if (metadataUri.startsWith('ar://')) return 'ar';
  if (metadataUri.startsWith('data:')) return 'data';
  return 'http';
};

// Re-export from `./metadataUri` so existing import sites keep working.
// The URI gate lives in its own module to keep the unit test
// (`authoring.spec.ts`) decoupled from `import.meta.env` references that the
// jest swc preset doesn't compile.
//
// `requiresIpfsForBlueprintMetadata` lives in `./runtime` for the same
// reason — it's the only `import.meta.env` reader in the metadata-parsing
// surface, and pulling it into this file would re-break the spec.
export { isAllowedBlueprintMetadataUri };

const sortMetadataValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortMetadataValue);
  }

  if (isRecord(value)) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortMetadataValue(value[key]);
        return result;
      }, {});
  }

  return value;
};

const stripMetadataAttestation = (
  value: Record<string, unknown>,
): Record<string, unknown> => {
  const { integrity: _integrity, ...rest } = value;
  return rest;
};

const toCanonicalMetadataJson = (value: Record<string, unknown>): string =>
  JSON.stringify(sortMetadataValue(value));

export const computeBlueprintMetadataPayloadHash = (
  value: Record<string, unknown>,
): Hex =>
  keccak256(toHex(new TextEncoder().encode(toCanonicalMetadataJson(value))));

const parseBlueprintMetadataAttestation = (
  value: unknown,
): BlueprintMetadataAttestation | null => {
  if (!isRecord(value)) {
    return null;
  }

  const schema = readTrimmedString(value.schema, 64);
  const signer = readTrimmedString(value.signer, 128);
  const signature = readTrimmedString(value.signature, 256);
  const payloadHash = readTrimmedString(value.payloadHash, 128);

  if (
    schema !== 'tangle-blueprint-metadata/v1' ||
    !signer ||
    !signature?.startsWith('0x') ||
    !payloadHash?.startsWith('0x')
  ) {
    return null;
  }

  try {
    return {
      schema: 'tangle-blueprint-metadata/v1',
      signer: getAddress(signer),
      signature: signature as `0x${string}`,
      payloadHash: payloadHash as `0x${string}`,
      signedAt: readTrimmedString(value.signedAt, 64),
    };
  } catch {
    return null;
  }
};

export const buildBlueprintMetadataAttestationMessage = ({
  blueprintId,
  owner,
  metadataUri,
  payloadHash,
}: {
  blueprintId: bigint;
  owner: Address;
  metadataUri: string;
  payloadHash: Hex;
}): string =>
  [
    'Tangle Blueprint Metadata Attestation',
    'schema: tangle-blueprint-metadata/v1',
    `blueprintId: ${blueprintId.toString()}`,
    `owner: ${owner.toLowerCase()}`,
    `metadataUri: ${metadataUri}`,
    `payloadHash: ${payloadHash}`,
  ].join('\n');

const buildDefaultMetadataVerification = ({
  metadataUri,
  status,
  reason,
  signer,
  payloadHash,
  attestationMode = 'none',
}: {
  metadataUri?: string | null;
  status: BlueprintMetadataVerification['status'];
  reason: string;
  signer?: string;
  payloadHash?: Hex;
  attestationMode?: BlueprintMetadataAttestationMode;
}): BlueprintMetadataVerification => {
  const source = toMetadataSource(metadataUri);
  // `productionReady` requires:
  //   - full signed attestation (`attestationMode === 'attestation'`)
  //   - hosting that's either content-addressed (`ipfs://`, `ar://`,
  //     `data:`) or otherwise immutable
  // HTTPS is rejected here because content can change at the host after
  // the URI is pinned on-chain. URI-keccak verification still renders
  // the declarative tier without lying about production-grade trust.
  const isImmutableSource =
    source === 'ipfs' || source === 'ar' || source === 'data';
  const productionReady =
    status === 'verified' &&
    attestationMode === 'attestation' &&
    isImmutableSource;

  return {
    status,
    productionReady,
    source,
    signer,
    payloadHash,
    attestationMode,
    reason,
  };
};

export const verifyBlueprintMetadataIntegrity = async ({
  rawMetadata,
  metadataUri,
  metadataHash,
  blueprintId,
  owner,
}: {
  rawMetadata: Record<string, unknown> | null;
  metadataUri: string | null;
  metadataHash?: Hex | null;
  blueprintId?: bigint;
  owner?: Address;
}): Promise<BlueprintMetadataVerification> => {
  if (!metadataUri) {
    return buildDefaultMetadataVerification({
      status: 'unverified',
      reason: 'No metadata URI was published onchain.',
    });
  }

  if (!rawMetadata) {
    return buildDefaultMetadataVerification({
      metadataUri,
      status: 'invalid',
      reason: 'Metadata payload could not be parsed as a JSON object.',
    });
  }

  if (!isAllowedBlueprintMetadataUri(metadataUri)) {
    return buildDefaultMetadataVerification({
      metadataUri,
      status: 'invalid',
      reason:
        'Metadata URI scheme not supported (expected ipfs://, https://, or http://).',
    });
  }

  const attestation = parseBlueprintMetadataAttestation(rawMetadata.integrity);
  const payloadHash = computeBlueprintMetadataPayloadHash(
    stripMetadataAttestation(rawMetadata),
  );
  // URI-keccak hash: the v0 register scripts pin `keccak256(metadataUri)` on
  // chain (not the canonical JSON payload hash). Recognizing this mode lets
  // the catalog render tier-2 surfaces today, while the v1 hash mode
  // (canonical payload + signed attestation) is still required for full
  // `verified` status / `productionReady` / iframe trust.
  const uriHash = keccak256(toHex(new TextEncoder().encode(metadataUri)));
  const uriKeccakMatch =
    metadataHash !== undefined &&
    metadataHash !== null &&
    metadataHash.toLowerCase() === uriHash.toLowerCase();
  const payloadHashMatch =
    metadataHash !== undefined &&
    metadataHash !== null &&
    metadataHash.toLowerCase() === payloadHash.toLowerCase();

  if (metadataHash && !payloadHashMatch && !uriKeccakMatch) {
    return buildDefaultMetadataVerification({
      metadataUri,
      status: 'invalid',
      payloadHash,
      reason: 'Fetched metadata did not match the onchain pinned payload hash.',
    });
  }

  if (!attestation) {
    // No signed attestation in the JSON.
    // If the on-chain hash is the URI-keccak (v0 register scripts), accept
    // the JSON as URI-bound — declarative tier renders, externalApp does
    // not. If the hash matched the canonical payload but there's no
    // attestation, that's still URI-bound trust (publisher pinned the
    // content snapshot but didn't sign over it for replay protection).
    if (uriKeccakMatch || payloadHashMatch) {
      return buildDefaultMetadataVerification({
        metadataUri,
        status: 'verified-uri',
        payloadHash,
        attestationMode: 'uri-only',
        reason: uriKeccakMatch
          ? 'On-chain metadataHash binds the metadata URI (v0 hash mode). Declarative surfaces enabled; iframe embedding requires a full payload attestation.'
          : 'On-chain metadataHash matches the canonical payload but no owner attestation is present. Declarative surfaces enabled; iframe embedding requires a signed attestation.',
      });
    }
    return buildDefaultMetadataVerification({
      metadataUri,
      status: 'unverified',
      payloadHash,
      reason:
        'No valid metadata attestation was published. Falling back to protocol-controlled surfaces.',
    });
  }

  if (!owner || blueprintId === undefined) {
    return buildDefaultMetadataVerification({
      metadataUri,
      status: 'unverified',
      signer: attestation.signer,
      payloadHash,
      reason:
        'Metadata attestation was present, but the onchain blueprint context needed to verify it was unavailable.',
    });
  }

  if (attestation.payloadHash.toLowerCase() !== payloadHash.toLowerCase()) {
    return buildDefaultMetadataVerification({
      metadataUri,
      status: 'invalid',
      signer: attestation.signer,
      payloadHash,
      reason:
        'Metadata attestation payload hash did not match the fetched document.',
    });
  }

  if (!isAddressEqual(attestation.signer as Address, owner)) {
    return buildDefaultMetadataVerification({
      metadataUri,
      status: 'invalid',
      signer: attestation.signer,
      payloadHash,
      reason:
        'Metadata attestation signer does not match the onchain blueprint owner.',
    });
  }

  const verified = await verifyMessage({
    address: owner,
    message: buildBlueprintMetadataAttestationMessage({
      blueprintId,
      owner,
      metadataUri,
      payloadHash,
    }),
    signature: attestation.signature,
  });

  if (!verified) {
    return buildDefaultMetadataVerification({
      metadataUri,
      status: 'invalid',
      signer: attestation.signer,
      payloadHash,
      reason: 'Metadata attestation signature verification failed.',
    });
  }

  return buildDefaultMetadataVerification({
    metadataUri,
    status: 'verified',
    signer: owner,
    payloadHash,
    attestationMode: 'attestation',
    reason:
      'Metadata attestation verified against the onchain blueprint owner and payload hash.',
  });
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
      readTrimmedString(publisherValue.name, 80) ??
      fallback?.author ??
      'Unknown publisher',
    namespace: readTrimmedString(publisherValue.namespace, 60),
    verified:
      publisherValue.verified === true ||
      publisherValue.verification === 'verified' ||
      publisherValue.verification === 'first-party',
  };

  const requestedSlug = sanitizeBlueprintSlug(
    readTrimmedString(value.requestedSlug, 80) ??
      readTrimmedString(value.slug, 80) ??
      '',
  );

  const resourcesValue = isRecord(value.resources) ? value.resources : {};
  const surfaces = normalizeSurfaces(value.surfaces);
  const theme = parseTheme(value.theme);
  const overviewCards = parseOverviewCards(value.overviewCards);
  const actions = parseActions(value.actions);
  const resourceViews = parseResourceViews(value.resourceViews);
  const modules = parseModules(value.modules);
  const modes = parseBlueprintModes(value.modes);
  const externalApp = normalizeExternalApp(value.externalApp);
  const hasDeclarativeContent =
    surfaces.length > 0 ||
    overviewCards !== undefined ||
    actions !== undefined ||
    resourceViews !== undefined ||
    modules !== undefined;

  return {
    displayName:
      readTrimmedString(value.displayName, 80) ??
      fallback?.name ??
      'Unknown Blueprint',
    description:
      readTrimmedString(value.description, MAX_DESCRIPTION_LENGTH) ??
      fallback?.description ??
      'No shared host metadata available yet.',
    requestedSlug: requestedSlug || undefined,
    canonicalSlug: buildCanonicalSlug(requestedSlug || undefined, publisher),
    publisher,
    resources: {
      serviceLabel:
        readTrimmedString(resourcesValue.serviceLabel, 60) ?? 'Service',
      itemLabel: readTrimmedString(resourcesValue.itemLabel, 60) ?? 'Resource',
      itemRoute: normalizeResourceRoute(resourcesValue.itemRoute),
    },
    surfaces,
    ...(theme ? { theme } : {}),
    ...(overviewCards ? { overviewCards } : {}),
    ...(actions ? { actions } : {}),
    ...(resourceViews ? { resourceViews } : {}),
    ...(modules ? { modules } : {}),
    ...(modes ? { modes } : {}),
    ...(externalApp ? { externalApp } : {}),
    tier:
      externalApp !== undefined
        ? 'link-out'
        : hasDeclarativeContent
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
      attestation: null,
      verification: buildDefaultMetadataVerification({
        status: 'invalid',
        reason: 'Metadata document was not a JSON object.',
      }),
      blueprintUi: null,
    };
  }

  const name = readTrimmedString(value.name, 80) ?? 'Unknown Blueprint';
  const description =
    readTrimmedString(value.description, MAX_DESCRIPTION_LENGTH) ??
    'No description available';
  const author = readTrimmedString(value.author, 80) ?? 'Unknown';
  const attestation = parseBlueprintMetadataAttestation(value.integrity);

  return {
    name,
    description,
    author,
    category: readTrimmedString(value.category, 60) ?? 'Other',
    imageUrl:
      sanitizePublicUrl(value.image, { allowIpfs: true }) ??
      sanitizePublicUrl(value.imageUrl, { allowIpfs: true }) ??
      sanitizePublicUrl(value.logo, { allowIpfs: true }),
    codeUrl:
      sanitizePublicUrl(value.codeUrl) ??
      sanitizePublicUrl(value.codeRepository) ??
      sanitizePublicUrl(value.repository),
    website:
      sanitizePublicUrl(value.website) ?? sanitizePublicUrl(value.homepage),
    attestation,
    verification: buildDefaultMetadataVerification({
      status: attestation ? 'unverified' : 'unverified',
      signer: attestation?.signer,
      payloadHash: attestation?.payloadHash,
      reason: attestation
        ? 'Metadata attestation was found and is waiting for onchain verification.'
        : 'No metadata attestation was published.',
    }),
    blueprintUi: parseBlueprintUiContract(value.blueprintUi, {
      name,
      description,
      author,
    }),
  };
};

export const parseBlueprintMetadataJsonText = (
  text: string,
): {
  parsed: ParsedBlueprintMetadata;
  rawMetadata: Record<string, unknown> | null;
} => {
  const bytes = new TextEncoder().encode(text).length;
  if (bytes > MAX_METADATA_BYTES) {
    throw new Error(
      `Blueprint metadata exceeded ${MAX_METADATA_BYTES} bytes and was rejected by the hosted runtime.`,
    );
  }

  const metadata: unknown = JSON.parse(text);
  const rawMetadata =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : null;

  return {
    parsed: parseBlueprintMetadataDocument(metadata),
    rawMetadata,
  };
};

export {
  resolveBlueprintMetadataFetchUrl,
  resolveBlueprintMetadataFetchUrls,
} from './metadataFetchUrl';

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
    image: readTrimmedString(logo, 2_048) ?? null,
    logo: readTrimmedString(logo, 2_048) ?? null,
    website: readTrimmedString(website, 2_048) ?? null,
    codeRepository: readTrimmedString(codeRepository, 2_048) ?? null,
    blueprintUi: {
      displayName: readTrimmedString(name, 80) ?? 'Unnamed Blueprint',
      description:
        readTrimmedString(description, MAX_DESCRIPTION_LENGTH) ??
        'Third-party blueprint hosted through the shared Tangle Cloud runtime.',
      requestedSlug: requestedSlug || undefined,
      publisher: {
        name: readTrimmedString(author, 80) ?? 'Unknown publisher',
        namespace: readTrimmedString(draft.publisherNamespace, 60),
        verified: false,
      },
      resources: {
        serviceLabel: readTrimmedString(draft.serviceNoun, 60) ?? 'Service',
        itemLabel: readTrimmedString(draft.resourceNoun, 60) ?? 'Resource',
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
      externalApp: isValidHttpsUrl(
        readTrimmedString(draft.externalAppUrl, 2_048),
      )
        ? {
            url: draft.externalAppUrl.trim(),
            mode: 'link',
          }
        : undefined,
    },
  };
};

export type BlueprintUiSurface =
  | 'generic-overview'
  | 'service-explorer'
  | 'service-console'
  | 'actions-panel'
  | 'resources'
  | 'chat'
  | 'vaults'
  | 'metrics'
  | 'permissions';

export type BlueprintResourceRoute =
  | 'bots'
  | 'agents'
  | 'runs'
  | 'vault'
  | 'chat'
  | 'custom';

export type BlueprintUiExternalAppMode = 'link' | 'iframe';

export type BlueprintMetadataAttestation = {
  schema: 'tangle-blueprint-metadata/v1';
  signer: string;
  signature: `0x${string}`;
  payloadHash: `0x${string}`;
  signedAt?: string;
};

export type BlueprintMetadataVerificationStatus =
  | 'verified'
  | 'verified-uri'
  | 'unverified'
  | 'invalid';

/**
 * `attestationMode` makes the trust gradient explicit:
 *  - 'attestation': owner signed the canonical JSON payload hash. Full trust.
 *  - 'uri-only':    on-chain `metadataHash` matches keccak256(metadataUri).
 *                   The URI is committed, but the JSON content is fetched
 *                   off-chain and could change at the host (github raw, etc).
 *                   Enough to render the declarative tier-2 surface; not
 *                   enough to unlock iframe (`externalApp`) embedding.
 *  - 'none':        no integrity binding on-chain. Generic fallback only.
 */
export type BlueprintMetadataAttestationMode =
  | 'attestation'
  | 'uri-only'
  | 'none';

export type BlueprintMetadataVerification = {
  status: BlueprintMetadataVerificationStatus;
  productionReady: boolean;
  /**
   * Where the metadata is hosted:
   *   - 'ipfs': `ipfs://<cid>` — content-addressed, immutable.
   *   - 'ar':   `ar://<txid>` — Arweave permanent storage, content-addressed.
   *   - 'data': `data:application/json,…` — inline. Trivially content-addressed.
   *   - 'http': any `https://` URL — mutable at host.
   *   - 'missing': metadataUri unset on-chain.
   */
  source: 'ipfs' | 'ar' | 'data' | 'http' | 'missing';
  signer?: string;
  payloadHash?: `0x${string}`;
  attestationMode?: BlueprintMetadataAttestationMode;
  reason: string;
};

export type BlueprintUiThemeIcon = 'bot' | 'shield' | 'graph' | 'spark';

export type BlueprintUiCardKind = 'stat' | 'callout' | 'links' | 'checklist';

export type BlueprintUiCardTone = 'neutral' | 'info' | 'success' | 'warning';

export type BlueprintUiActionFieldInput =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'toggle';

export type BlueprintUiActionTarget = 'blueprint' | 'service' | 'resource';

export type BlueprintUiResourceViewKind = 'table' | 'grid' | 'timeline';

export type BlueprintUiResourceViewTarget = 'service' | 'resource';

export type BlueprintUiModuleKey =
  | 'metrics-overview'
  | 'service-health'
  | 'resource-events'
  | 'permissions-matrix'
  | 'activity-feed';

export type BlueprintUiModuleSlot =
  | 'overview'
  | 'sidebar'
  | 'actions'
  | 'resources';

export type BlueprintUiAuthoringDraft = {
  requestedSlug: string;
  publisherNamespace: string;
  serviceNoun: string;
  resourceNoun: string;
  resourceRoute: BlueprintResourceRoute;
  surfaces: BlueprintUiSurface[];
  externalAppUrl: string;
  externalAppMode: BlueprintUiExternalAppMode;
};

export type BlueprintUiPublisher = {
  name: string;
  namespace?: string;
  verified: boolean;
};

export type BlueprintUiResources = {
  serviceLabel: string;
  itemLabel: string;
  itemRoute: BlueprintResourceRoute;
};

export type BlueprintUiExternalApp = {
  url: string;
  mode: BlueprintUiExternalAppMode;
};

export type BlueprintUiTier = 'generic' | 'declarative' | 'link-out';

export type BlueprintUiTheme = {
  accentColor?: string;
  secondaryColor?: string;
  badgeLabel?: string;
  icon?: BlueprintUiThemeIcon;
};

export type BlueprintUiCardLink = {
  label: string;
  href: string;
};

export type BlueprintUiOverviewCard = {
  id: string;
  kind: BlueprintUiCardKind;
  title: string;
  description?: string;
  value?: string;
  tone?: BlueprintUiCardTone;
  links?: BlueprintUiCardLink[];
  items?: string[];
};

export type BlueprintUiActionFieldOption = {
  label: string;
  value: string;
};

export type BlueprintUiActionField = {
  key: string;
  label: string;
  input: BlueprintUiActionFieldInput;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: BlueprintUiActionFieldOption[];
};

export type BlueprintUiAction = {
  id: string;
  label: string;
  description?: string;
  target: BlueprintUiActionTarget;
  submitLabel?: string;
  href?: string;
  fields?: BlueprintUiActionField[];
};

export type BlueprintUiResourceViewColumn = {
  key: string;
  label: string;
  emphasis?: boolean;
};

export type BlueprintUiResourceView = {
  id: string;
  title: string;
  kind: BlueprintUiResourceViewKind;
  target: BlueprintUiResourceViewTarget;
  defaultSort?: string;
  columns: BlueprintUiResourceViewColumn[];
};

export type BlueprintUiModuleBinding = {
  module: BlueprintUiModuleKey;
  slot: BlueprintUiModuleSlot;
  title?: string;
  metricKeys?: string[];
  eventKinds?: string[];
};

/**
 * One on-chain operational mode of a blueprint that otherwise shares its
 * `(publisher.namespace, requestedSlug)` identity with sibling modes. The
 * catalog collapses by identity so the wall doesn't show N near-identical
 * cards; the detail page renders a picker; the iframe receives the picked
 * mode through `?mode=<id>&blueprintId=<id>` so the embedded app can
 * dispatch on it without a separate URL per mode.
 *
 * `blueprintId` is stored as `number` for ergonomics — modes are declared by
 * the publisher and stay small. The dapp coerces to `bigint` at the routing
 * boundary where it joins indexer-derived ids.
 */
export type BlueprintMode = {
  /** Stable identifier passed to the iframe as `?mode=<id>`. */
  id: string;
  /** Short label shown in the mode picker chips. */
  label: string;
  /** One-line description rendered next to the label. */
  description?: string;
  /** On-chain blueprint ID for this mode. */
  blueprintId: number;
  /** Optional ribbon / badge for this mode card (e.g. 'Recommended', 'Premium'). */
  tagline?: string;
};

export type BlueprintUiContract = {
  displayName: string;
  description: string;
  requestedSlug?: string;
  canonicalSlug?: string;
  publisher: BlueprintUiPublisher;
  resources: BlueprintUiResources;
  surfaces: BlueprintUiSurface[];
  theme?: BlueprintUiTheme;
  overviewCards?: BlueprintUiOverviewCard[];
  actions?: BlueprintUiAction[];
  resourceViews?: BlueprintUiResourceView[];
  modules?: BlueprintUiModuleBinding[];
  externalApp?: BlueprintUiExternalApp;
  /**
   * When multiple on-chain blueprints share a `(publisher, requestedSlug)`
   * identity (e.g. the same product deployed with different operator
   * selection / isolation / attestation requirements), declare each one
   * as a mode. The catalog dedupes by identity and shows ONE entry; the
   * detail page renders a mode picker. The mode the operator selects
   * is passed to the iframe via `?mode=<id>&blueprintId=<id>` so the
   * iframe app can dispatch on it.
   *
   * Absent → single-mode blueprint, no picker, default routing.
   * Present → catalog collapses; detail picker shows.
   */
  modes?: BlueprintMode[];
  tier: BlueprintUiTier;
};

export type ParsedBlueprintMetadata = {
  name: string;
  description: string;
  author: string;
  category: string;
  imageUrl: string | null;
  codeUrl: string | null;
  website: string | null;
  attestation: BlueprintMetadataAttestation | null;
  verification: BlueprintMetadataVerification;
  blueprintUi: BlueprintUiContract | null;
};

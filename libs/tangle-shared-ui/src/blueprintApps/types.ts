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
  | 'unverified'
  | 'invalid';

export type BlueprintMetadataVerification = {
  status: BlueprintMetadataVerificationStatus;
  productionReady: boolean;
  source: 'ipfs' | 'http' | 'missing';
  signer?: string;
  payloadHash?: `0x${string}`;
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

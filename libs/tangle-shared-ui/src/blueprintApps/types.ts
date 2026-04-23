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

export type BlueprintUiContract = {
  displayName: string;
  description: string;
  requestedSlug?: string;
  canonicalSlug?: string;
  publisher: BlueprintUiPublisher;
  resources: BlueprintUiResources;
  surfaces: BlueprintUiSurface[];
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
  blueprintUi: BlueprintUiContract | null;
};

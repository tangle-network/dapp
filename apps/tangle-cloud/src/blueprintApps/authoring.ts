import type {
  BlueprintExternalAppMode,
  BlueprintResourceRoute,
  BlueprintUiManifest,
  BlueprintUiSurface,
} from './types';
import { isTrustedExternalAppHost } from './resolver';

export type BlueprintUiAuthoringDraft = {
  requestedSlug: string;
  publisherNamespace: string;
  serviceNoun: string;
  resourceNoun: string;
  resourceRoute: BlueprintResourceRoute;
  surfaces: BlueprintUiSurface[];
  externalAppUrl: string;
  externalAppMode: BlueprintExternalAppMode;
};

export type BuildBlueprintUiMetadataDocumentParams = {
  name: string;
  description: string;
  category?: string;
  codeRepository?: string;
  logo?: string;
  website?: string;
  author?: string;
  draft: BlueprintUiAuthoringDraft;
};

export const DEFAULT_BLUEPRINT_UI_SURFACES: BlueprintUiSurface[] = [
  'generic-overview',
  'service-explorer',
  'service-console',
  'actions-panel',
  'resources',
  'permissions',
];

export const DEFAULT_BLUEPRINT_UI_DRAFT: BlueprintUiAuthoringDraft = {
  requestedSlug: '',
  publisherNamespace: '',
  serviceNoun: 'service',
  resourceNoun: 'resource',
  resourceRoute: 'custom',
  surfaces: DEFAULT_BLUEPRINT_UI_SURFACES,
  externalAppUrl: '',
  externalAppMode: 'link',
};

const trim = (value: string): string => value.trim();

export const sanitizeBlueprintUiDraft = (
  draft: BlueprintUiAuthoringDraft,
): BlueprintUiAuthoringDraft => ({
  requestedSlug: trim(draft.requestedSlug),
  publisherNamespace: trim(draft.publisherNamespace),
  serviceNoun: trim(draft.serviceNoun) || 'service',
  resourceNoun: trim(draft.resourceNoun) || 'resource',
  resourceRoute: draft.resourceRoute,
  surfaces:
    draft.surfaces.length > 0
      ? Array.from(new Set(draft.surfaces))
      : DEFAULT_BLUEPRINT_UI_SURFACES,
  externalAppUrl: trim(draft.externalAppUrl),
  externalAppMode: draft.externalAppMode,
});

const buildTagline = (name: string, category?: string): string => {
  const trimmedCategory = category?.trim();
  if (trimmedCategory) {
    return `${trimmedCategory} blueprint on Tangle`;
  }

  return `${name.trim() || 'Blueprint'} on Tangle`;
};

const buildManifest = ({
  name,
  description,
  category,
  draft,
}: {
  name: string;
  description: string;
  category?: string;
  draft: BlueprintUiAuthoringDraft;
}): BlueprintUiManifest => {
  const sanitizedDraft = sanitizeBlueprintUiDraft(draft);
  let externalApp: BlueprintUiManifest['externalApp'];

  if (sanitizedDraft.externalAppUrl) {
    try {
      const host = new URL(sanitizedDraft.externalAppUrl).hostname;
      const trust = isTrustedExternalAppHost(host) ? 'trusted' : 'restricted';

      externalApp = {
        url: sanitizedDraft.externalAppUrl,
        mode: sanitizedDraft.externalAppMode,
        label: 'Open blueprint app',
        host,
        trust,
        ...(trust === 'restricted'
          ? {
              reason:
                'External app host is not on the trusted Tangle allowlist yet.',
            }
          : {}),
      };
    } catch {
      externalApp = undefined;
    }
  }

  return {
    displayName: trim(name) || 'Untitled blueprint',
    tagline: buildTagline(name, category),
    description:
      trim(description) ||
      'Blueprint metadata published for the shared Tangle Cloud host surface.',
    surfaces: sanitizedDraft.surfaces,
    resources: {
      serviceNoun: sanitizedDraft.serviceNoun,
      resourceNoun: sanitizedDraft.resourceNoun,
      resourceRoute: sanitizedDraft.resourceRoute,
    },
    ...(externalApp ? { externalApp } : {}),
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
}: BuildBlueprintUiMetadataDocumentParams): Record<string, unknown> => {
  const sanitizedDraft = sanitizeBlueprintUiDraft(draft);

  return {
    ...(trim(name) ? { name: trim(name) } : {}),
    ...(trim(description) ? { description: trim(description) } : {}),
    ...(trim(category ?? '') ? { category: trim(category ?? '') } : {}),
    ...(trim(author ?? '') ? { author: trim(author ?? '') } : {}),
    ...(trim(codeRepository ?? '')
      ? { codeRepository: trim(codeRepository ?? '') }
      : {}),
    ...(trim(logo ?? '') ? { logo: trim(logo ?? '') } : {}),
    ...(trim(website ?? '') ? { website: trim(website ?? '') } : {}),
    blueprintUi: {
      ...(sanitizedDraft.requestedSlug
        ? { slug: sanitizedDraft.requestedSlug }
        : {}),
      ...(sanitizedDraft.publisherNamespace
        ? {
            publisher: {
              namespace: sanitizedDraft.publisherNamespace,
            },
          }
        : {}),
      ...buildManifest({
        name,
        description,
        category,
        draft: sanitizedDraft,
      }),
    },
  };
};

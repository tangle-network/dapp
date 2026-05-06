import {
  buildBlueprintUiMetadataDocument as buildSharedBlueprintUiMetadataDocument,
  DEFAULT_BLUEPRINT_UI_DRAFT as SHARED_DEFAULT_BLUEPRINT_UI_DRAFT,
} from '@tangle-network/tangle-shared-ui/blueprintApps/authoring';
import type { BlueprintUiAuthoringDraft } from '@tangle-network/tangle-shared-ui/blueprintApps/types';

export type { BlueprintUiAuthoringDraft };

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

export const DEFAULT_BLUEPRINT_UI_DRAFT = {
  ...SHARED_DEFAULT_BLUEPRINT_UI_DRAFT,
};

const trim = (value: string): string => value.trim();

export const sanitizeBlueprintUiDraft = (
  draft: BlueprintUiAuthoringDraft,
): BlueprintUiAuthoringDraft => ({
  requestedSlug: trim(draft.requestedSlug),
  publisherNamespace: trim(draft.publisherNamespace),
  serviceNoun: trim(draft.serviceNoun) || 'Service',
  resourceNoun: trim(draft.resourceNoun) || 'Resource',
  resourceRoute: draft.resourceRoute,
  surfaces:
    draft.surfaces.length > 0
      ? Array.from(new Set(draft.surfaces))
      : DEFAULT_BLUEPRINT_UI_DRAFT.surfaces,
  externalAppUrl: trim(draft.externalAppUrl),
  externalAppMode: draft.externalAppMode,
});

export const buildBlueprintUiMetadataDocument = ({
  name,
  description,
  category,
  codeRepository,
  logo,
  website,
  author,
  draft,
}: BuildBlueprintUiMetadataDocumentParams): Record<string, unknown> =>
  buildSharedBlueprintUiMetadataDocument({
    name,
    description,
    category: category ?? '',
    codeRepository: codeRepository ?? '',
    logo: logo ?? '',
    website: website ?? '',
    author: author ?? '',
    draft: sanitizeBlueprintUiDraft(draft),
  });

import { useMemo } from 'react';
import type { Blueprint as IndexedBlueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import type { BlueprintWithMetadata } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  buildBlueprintManifestFromMetadata,
  buildGenericBlueprintAppEntry,
} from './manifest';
import { resolveBlueprintAppView } from './resolver';
import { getBlueprintAppBySlug, getBlueprintAppForMetadata } from './registry';

/**
 * Extract the matchable identity from a parsed blueprint manifest. The
 * curated registry checks declared `publisher.namespace` + `requestedSlug`,
 * which are both surfaced after metadata parsing. The legacy
 * `IndexedBlueprint` shape (used in the chain-only path) doesn't carry
 * either field, so `resolveBlueprintViewFromBlueprint` can't curate.
 */
const matcherFromMetadata = (
  blueprint: BlueprintWithMetadata,
): { publisherNamespace?: string; requestedSlug?: string } => ({
  publisherNamespace: blueprint.blueprintUi?.publisher?.namespace ?? undefined,
  requestedSlug: blueprint.blueprintUi?.requestedSlug ?? undefined,
});

export function resolveBlueprintViewFromBlueprint(
  blueprint: IndexedBlueprint | null | undefined,
) {
  if (!blueprint) {
    return null;
  }

  // No metadata available on the chain-only `IndexedBlueprint` — skip the
  // curated lookup and fall through to the generic view. The metadata-aware
  // resolver below is what actually surfaces curated apps.
  return resolveBlueprintAppView(buildGenericBlueprintAppEntry(blueprint));
}

export function resolveBlueprintViewFromIndexedBlueprint(
  blueprint: BlueprintWithMetadata | null | undefined,
) {
  if (!blueprint) {
    return null;
  }

  const curated = getBlueprintAppForMetadata(matcherFromMetadata(blueprint));
  if (curated) {
    return resolveBlueprintAppView(curated);
  }

  return resolveBlueprintAppView(
    buildBlueprintManifestFromMetadata(blueprint).entry,
  );
}

export function resolveBlueprintViewFromSlugOrBlueprint(
  slug: string | null | undefined,
  blueprint: IndexedBlueprint | null | undefined,
) {
  if (slug) {
    const curated = getBlueprintAppBySlug(slug);
    if (curated) {
      return resolveBlueprintAppView(curated);
    }
  }

  return resolveBlueprintViewFromBlueprint(blueprint);
}

export function useResolvedBlueprintViewFromBlueprint(
  blueprint: IndexedBlueprint | null | undefined,
) {
  return useMemo(
    () => resolveBlueprintViewFromBlueprint(blueprint),
    [blueprint],
  );
}

export function useResolvedBlueprintViewFromIndexedBlueprint(
  blueprint: BlueprintWithMetadata | null | undefined,
) {
  return useMemo(
    () => resolveBlueprintViewFromIndexedBlueprint(blueprint),
    [blueprint],
  );
}

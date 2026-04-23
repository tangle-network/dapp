import { useMemo } from 'react';
import type { Blueprint as IndexedBlueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import type { BlueprintWithMetadata } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  buildBlueprintManifestFromMetadata,
  buildGenericBlueprintAppEntry,
} from './manifest';
import { resolveBlueprintAppView } from './resolver';
import {
  getBlueprintAppByBlueprintId,
  getBlueprintAppBySlug,
} from './registry';

export function resolveBlueprintViewFromBlueprint(
  blueprint: IndexedBlueprint | null | undefined,
) {
  if (!blueprint) {
    return null;
  }

  const curated = getBlueprintAppByBlueprintId(blueprint.id);
  if (curated) {
    return resolveBlueprintAppView(curated);
  }

  return resolveBlueprintAppView(buildGenericBlueprintAppEntry(blueprint));
}

export function resolveBlueprintViewFromIndexedBlueprint(
  blueprint: BlueprintWithMetadata | null | undefined,
) {
  if (!blueprint) {
    return null;
  }

  const curated = getBlueprintAppByBlueprintId(blueprint.blueprintId);
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

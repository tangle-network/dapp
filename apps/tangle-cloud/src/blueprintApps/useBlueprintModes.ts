import { useMemo } from 'react';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import type {
  BlueprintMode,
  BlueprintUiContract,
} from '@tangle-network/tangle-shared-ui/blueprintApps/types';
import { useAllBlueprints } from '@tangle-network/tangle-shared-ui/data/graphql';
import { dedupeBlueprintsByIdentity } from './dedupe';

/**
 * Minimal shape the hook needs from a blueprint — a `bigint` on-chain id
 * (to look up siblings) and parsed `blueprintUi.modes` (to honor declared
 * modes). The two `Blueprint` shapes in this codebase pick different
 * field names for the on-chain id (`id` vs `blueprintId`), so the hook
 * accepts either via a small adapter at the call site.
 */
type BlueprintModeInput = {
  /** On-chain blueprint id, regardless of which Blueprint shape this came from. */
  onChainId: bigint;
  blueprintUi?: BlueprintUiContract | null;
};

const adaptInput = (
  blueprint:
    | { id: bigint; blueprintUi?: BlueprintUiContract | null }
    | { blueprintId: bigint; blueprintUi?: BlueprintUiContract | null }
    | null
    | undefined,
): BlueprintModeInput | null => {
  if (!blueprint) {
    return null;
  }
  // Prefer the chain-shape `id` (types/blueprint.Blueprint) but fall back
  // to `blueprintId` (graphql.Blueprint) so the hook accepts either.
  const onChainId =
    'id' in blueprint && typeof blueprint.id === 'bigint'
      ? blueprint.id
      : 'blueprintId' in blueprint
        ? blueprint.blueprintId
        : null;
  if (onChainId === null) {
    return null;
  }
  return { onChainId, blueprintUi: blueprint.blueprintUi };
};

/**
 * Resolve the mode picker entries for a blueprint, in priority order:
 *
 *   1. `blueprintUi.modes` declared on the parsed metadata. Once metadata
 *      ships modes, that's authoritative.
 *   2. The catalog dedupe pass — if other blueprints share this one's
 *      `(publisher.namespace, requestedSlug)` identity, the dev fallback
 *      synthesizes a modes list (sandbox / trading).
 *
 * Returns an empty array when the blueprint is single-mode (no picker).
 * The hook depends on `useAllBlueprints` so it can find siblings — the
 * query is already in cache for the catalog and detail flow, so this is
 * effectively free.
 */
export function useBlueprintModes(
  blueprint:
    | { id: bigint; blueprintUi?: BlueprintUiContract | null }
    | { blueprintId: bigint; blueprintUi?: BlueprintUiContract | null }
    | null
    | undefined,
): BlueprintMode[] {
  const { blueprints } = useAllBlueprints();

  return useMemo(() => {
    const input = adaptInput(blueprint);
    if (!input) {
      return [];
    }

    // Declared modes always win. The catalog dedupe pass is a fallback for
    // blueprints whose metadata hasn't yet shipped a `modes` array.
    const declared = input.blueprintUi?.modes;
    if (declared && declared.length > 0) {
      return declared;
    }

    // Locate the dedupe row this blueprint belongs to. The dedupe pass
    // returns rows keyed by canonical blueprint; aliases are siblings of
    // a different on-chain id. We may be the canonical OR an alias, so
    // match by id across both lists.
    const rows: ReturnType<typeof dedupeBlueprintsByIdentity> =
      dedupeBlueprintsByIdentity(
        Array.from(blueprints.values()) as Blueprint[],
      );
    const row = rows.find((candidate) => {
      if (candidate.blueprint.id === input.onChainId) {
        return true;
      }
      return candidate.aliases.some(
        (alias) => alias.blueprintId === input.onChainId,
      );
    });

    return row?.modes ?? [];
  }, [blueprint, blueprints]);
}

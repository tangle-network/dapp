import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import type { BlueprintMode } from '@tangle-network/tangle-shared-ui/blueprintApps/types';

/**
 * Identity key used to collapse the catalog. Two blueprints share an
 * identity when their parsed metadata declares the same publisher
 * namespace AND the same requested slug. Anything missing one of those
 * fields stays a singleton — without an identity we can't safely claim
 * it as a mode of something else.
 */
const identityKey = (blueprint: Blueprint): string | null => {
  const namespace = blueprint.blueprintUi?.publisher?.namespace?.toLowerCase();
  const slug = blueprint.blueprintUi?.requestedSlug?.toLowerCase();
  if (!namespace || !slug) {
    return null;
  }
  return `${namespace}/${slug}`;
};

export type BlueprintAliasLink = {
  /** On-chain blueprint id of the sibling deployment. */
  blueprintId: bigint;
  /** Mode id this sibling represents, when one is declared. */
  mode?: BlueprintMode;
};

export type DedupedBlueprintRow = {
  /** Canonical entry — the blueprint with the LOWEST on-chain id in the group. */
  blueprint: Blueprint;
  /** Sibling blueprints, in declared-mode order when modes are present. */
  aliases: BlueprintAliasLink[];
  /** Modes resolved for this row, either declared on metadata or fallback. */
  modes?: BlueprintMode[];
};

/**
 * Dev fallback: hardcoded mode tables for the two reserved first-party
 * curated apps (`sandbox`, `trading`). These get applied when the catalog
 * surfaces multiple blueprints sharing the publisher+slug identity but the
 * metadata JSON doesn't yet declare a `modes` array — the metadata-side
 * work to add `modes` to the source repos is happening in parallel.
 *
 * Once the metadata ships, the JSON-declared modes always win (synthesis
 * is keyed on `modes` being absent across every group member). Remove this
 * fallback in a follow-up after the metadata is live.
 *
 * The id strings here MUST match the parallel agent's metadata work
 * (`cloud`, `instance`, `tee`, `validator`). Iframe consumers dispatch on
 * them, so an off-by-one rename here breaks the iframe contract.
 */
const DEV_FALLBACK_MODES: Record<
  string,
  Array<{ id: string; label: string; description?: string; tagline?: string }>
> = {
  'tangle/ai-agent-sandbox': [
    {
      id: 'cloud',
      label: 'Cloud',
      description: 'Shared-tenant agent sandbox on Tangle Cloud operators.',
      tagline: 'Recommended',
    },
    {
      id: 'instance',
      label: 'Dedicated instance',
      description: 'Single-tenant VM, isolated network, your own keys.',
    },
    {
      id: 'tee',
      label: 'TEE',
      description: 'Confidential compute with hardware attestation.',
      tagline: 'Premium',
    },
  ],
  'tangle/ai-trading': [
    {
      id: 'cloud',
      label: 'Cloud',
      description: 'Shared-tenant trading runtime on Tangle Cloud operators.',
      tagline: 'Recommended',
    },
    {
      id: 'instance',
      label: 'Dedicated instance',
      description: 'Single-tenant VM, isolated network, your own keys.',
    },
    {
      id: 'tee',
      label: 'TEE',
      description: 'Confidential compute with hardware attestation.',
      tagline: 'Premium',
    },
    {
      id: 'validator',
      label: 'Validator',
      description: 'Validator-attested execution lane.',
    },
  ],
};

/**
 * Synthesize a `modes` array for a group whose metadata didn't declare
 * one, using the dev fallback table. Each fallback mode is paired with a
 * group blueprint id in catalog order — the deterministic on-chain-id
 * ascending sort makes this stable across renders. Returns `undefined`
 * when the group is for an identity without a dev-fallback entry, or
 * when there's only one member (nothing to dedupe).
 */
const synthesizeFallbackModes = (
  identity: string,
  members: Blueprint[],
): BlueprintMode[] | undefined => {
  if (members.length < 2) {
    return undefined;
  }
  const table = DEV_FALLBACK_MODES[identity];
  if (!table) {
    return undefined;
  }
  // Pair fallback ids with members in on-chain id ascending order so each
  // sibling deterministically maps to the same mode across reloads. If the
  // group has more members than the table, the excess members fall back
  // to a numeric `mode-N` id so the iframe still receives a stable token.
  return members.map((member, index) => {
    const entry = table[index];
    if (entry) {
      return {
        id: entry.id,
        label: entry.label,
        blueprintId: Number(member.id),
        description: entry.description,
        tagline: entry.tagline,
      };
    }
    return {
      id: `mode-${index + 1}`,
      label: `Mode ${index + 1}`,
      blueprintId: Number(member.id),
    };
  });
};

/**
 * Collapses the catalog list by `(publisher.namespace, requestedSlug)`
 * identity. For each group:
 *
 *  - The canonical entry is the blueprint with the LOWEST on-chain id —
 *    stable across redeploys, matches what `getBlueprintAppForMetadata`
 *    will resolve when the user clicks the curated card.
 *  - Aliases are the remaining group members, in on-chain id ascending
 *    order. When the canonical blueprint declares `modes`, aliases pick
 *    up their mode by matching `blueprintId`; otherwise the dev fallback
 *    synthesizes a modes list for known curated identities (sandbox,
 *    trading).
 *  - Blueprints without a `(namespace, slug)` identity stay singleton
 *    rows and render unchanged.
 *
 * The output preserves the input ordering for non-deduped rows so the
 * "featured first / blueprint id desc" sort upstream still applies.
 */
export function dedupeBlueprintsByIdentity(
  blueprints: Blueprint[],
): DedupedBlueprintRow[] {
  const groups = new Map<string, Blueprint[]>();
  const singletons: Blueprint[] = [];
  // Track insertion order so the deduped row appears where the FIRST
  // catalog-order member appeared. Without this the dedup would scramble
  // the operator-curated "featured → ranked" sort upstream.
  const groupFirstIndex = new Map<string, number>();

  blueprints.forEach((blueprint, index) => {
    const key = identityKey(blueprint);
    if (!key) {
      singletons.push(blueprint);
      return;
    }
    let bucket = groups.get(key);
    if (!bucket) {
      bucket = [];
      groups.set(key, bucket);
      groupFirstIndex.set(key, index);
    }
    bucket.push(blueprint);
  });

  const dedupedGroups: Array<{ index: number; row: DedupedBlueprintRow }> = [];

  for (const [key, members] of groups.entries()) {
    if (members.length === 1) {
      // Single-member groups behave like singletons — no aliases, no picker.
      dedupedGroups.push({
        index: groupFirstIndex.get(key) ?? Number.MAX_SAFE_INTEGER,
        row: { blueprint: members[0], aliases: [] },
      });
      continue;
    }

    // Sort members by on-chain id ascending. Canonical = lowest id.
    const sorted = [...members].sort((a, b) => (a.id < b.id ? -1 : 1));
    const canonical = sorted[0];

    // Modes resolution priority:
    //   1. `modes` declared on any group member's metadata (canonical first)
    //   2. dev fallback table keyed on identity
    // The declared path wins as soon as ANY metadata arrives, so the dev
    // fallback decommissions itself blueprint-by-blueprint as the parallel
    // metadata work lands.
    const declared = sorted
      .map((member) => member.blueprintUi?.modes)
      .find((modes) => modes && modes.length > 0);
    const modes = declared ?? synthesizeFallbackModes(key, sorted);

    const aliases: BlueprintAliasLink[] = sorted.slice(1).map((member) => ({
      blueprintId: member.id,
      mode: modes?.find((m) => BigInt(m.blueprintId) === member.id),
    }));

    dedupedGroups.push({
      index: groupFirstIndex.get(key) ?? Number.MAX_SAFE_INTEGER,
      row: { blueprint: canonical, aliases, modes },
    });
  }

  // Merge singletons + deduped groups back into the original ordering.
  // Each singleton uses its position in the input list; each group uses
  // the first-occurrence index of its earliest member. The sort is stable
  // so the upstream featured-first ranking survives the dedup pass.
  const indexedSingletons = singletons.map((blueprint) => ({
    index: blueprints.indexOf(blueprint),
    row: { blueprint, aliases: [] } satisfies DedupedBlueprintRow,
  }));
  const indexed = [...dedupedGroups, ...indexedSingletons];
  indexed.sort((a, b) => a.index - b.index);

  return indexed.map((entry) => entry.row);
}

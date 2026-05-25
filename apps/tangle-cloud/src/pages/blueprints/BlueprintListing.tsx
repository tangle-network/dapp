import type { RowSelectionState } from '@tanstack/table-core';
import {
  Button,
  Card,
  CardContent,
  Skeleton,
} from '../../components/sandbox/SandboxUi';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '@tangle-network/sandbox-ui/primitives';
import { EmptyState, FilterTray, PageToolbar } from '../../components/chrome';
import {
  enumCodec,
  intCodec,
  stringCodec,
  useUrlState,
} from '../../components/chrome/useUrlState';
import { typeRole } from '../../styles/chrome';
import type { UseAllBlueprintsReturn } from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import {
  Dispatch,
  FC,
  SetStateAction,
  useDeferredValue,
  useEffect,
  useMemo,
} from 'react';
import { useQueries } from '@tanstack/react-query';
import { useChainId, usePublicClient } from 'wagmi';
import type { Address } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import BinaryUpgradeABI from '@tangle-network/tangle-shared-ui/abi/tangleBinaryUpgrade';
import {
  fetchAttestations,
  fetchAuditorOnChain,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions';
import {
  AttestationKind,
  type Auditor,
} from '@tangle-network/tangle-shared-ui/blueprintApps/trustScore';
import { auditorFallbackRegistry } from '../../auditors';
import { Link } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { PagePath } from '../../types';
import { BlueprintVisual } from '../../components/blueprints/BlueprintVisual';
import { formatBlueprintName } from '../../components/blueprints/blueprintVisualUtils';
import {
  categoryBadgeStyle,
  categoryStripeStyle,
} from '../../components/blueprints/categoryColor';
import {
  AuditedPill,
  BlueprintTrustChip,
} from '../../components/binaryUpgrade/BlueprintTrustChip';
import {
  dedupeBlueprintsByIdentity,
  type DedupedBlueprintRow,
} from '../../blueprintApps/dedupe';

const PAGE_SIZE = 12;
const ALL_CATEGORIES = 'All categories';

type AudienceFilter = 'all' | 'customers' | 'operators';
type ManifestFilter = 'all' | 'verified' | 'fallback';
type AuditFilter = 'all' | 'audited';

type Props = {
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: Dispatch<SetStateAction<RowSelectionState>>;
  onRegisterBlueprint?: (blueprint: Blueprint) => void;
} & Omit<UseAllBlueprintsReturn, 'refetch'>;

const shortenIdentity = (value: string) => {
  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const pluralize = (label: string, count: number) =>
  count === 1 ? label : `${label}s`;

const getBlueprintCategory = (blueprint: Blueprint) => {
  const explicitCategory = blueprint.category?.trim();

  if (explicitCategory) {
    return explicitCategory;
  }

  const searchable =
    `${blueprint.name} ${blueprint.description ?? ''}`.toLowerCase();

  if (
    /\b(vector|embedding|rag|store|database|index|retrieval)\b/.test(searchable)
  ) {
    return 'Data';
  }

  if (/\b(agent|sandbox|automation|bot)\b/.test(searchable)) {
    return 'Agents';
  }

  if (/\b(trading|market|strategy|portfolio)\b/.test(searchable)) {
    return 'Trading';
  }

  if (/\b(training|train|fine[- ]?tune|checkpoint)\b/.test(searchable)) {
    return 'Training';
  }

  if (
    /\b(ai|llm|inference|model|image|video|voice|avatar|modal|gpu)\b/.test(
      searchable,
    )
  ) {
    return 'Inference';
  }

  return 'Other';
};

const hasVerifiedManifest = (blueprint: Blueprint) =>
  blueprint.metadataVerification?.status === 'verified';

const matchesSearch = (blueprint: Blueprint, query: string) => {
  if (query === '') {
    return true;
  }

  const haystack = [
    blueprint.name,
    blueprint.description,
    blueprint.author,
    blueprint.category,
    getBlueprintCategory(blueprint),
    blueprint.id.toString(),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
};

const BlueprintListing: FC<Props> = ({
  rowSelection,
  onRowSelectionChange,
  blueprints,
  isLoading,
  error,
  onRegisterBlueprint,
}) => {
  // Filter state lives in the URL — refresh persists the view, deep-links are
  // shareable, the back button works. Defaults are omitted from the URL so a
  // bare /blueprints stays clean. `replace: true` (in `useUrlState`) means
  // every keystroke doesn't pollute the history stack.
  const [page, setPage] = useUrlState('page', intCodec(0));
  const [searchQuery, setSearchQuery] = useUrlState('q', stringCodec(''));
  const [selectedCategory, setSelectedCategory] = useUrlState(
    'category',
    stringCodec(ALL_CATEGORIES),
  );
  const [audienceFilter, setAudienceFilter] = useUrlState<AudienceFilter>(
    'avail',
    enumCodec(['all', 'customers', 'operators'] as const, 'all'),
  );
  const [manifestFilter, setManifestFilter] = useUrlState<ManifestFilter>(
    'source',
    enumCodec(['all', 'verified', 'fallback'] as const, 'all'),
  );
  const [auditFilter, setAuditFilter] = useUrlState<AuditFilter>(
    'trust',
    enumCodec(['all', 'audited'] as const, 'all'),
  );
  const deferredSearchQuery = useDeferredValue(
    searchQuery.trim().toLowerCase(),
  );

  const blueprintItems = useMemo(() => {
    return Array.from(blueprints.values()).sort((a, b) => {
      if (a.isBoosted && !b.isBoosted) return -1;
      if (!a.isBoosted && b.isBoosted) return 1;
      return Number(b.id - a.id);
    });
  }, [blueprints]);

  // Audited-status map keyed by blueprintId string. We pre-fetch in parallel
  // so the "Audited only" toggle can filter before pagination — otherwise
  // we'd render the wrong page count when toggling.
  const auditedStatus = useAuditedStatusMap(blueprintItems.map((b) => b.id));

  const categories = useMemo(() => {
    const counts = new Map<string, number>();

    for (const blueprint of blueprintItems) {
      const category = getBlueprintCategory(blueprint);
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, count]) => ({ category, count }));
  }, [blueprintItems]);

  const filteredBlueprints = useMemo(() => {
    return blueprintItems.filter((blueprint) => {
      if (!matchesSearch(blueprint, deferredSearchQuery)) {
        return false;
      }

      if (
        selectedCategory !== ALL_CATEGORIES &&
        getBlueprintCategory(blueprint) !== selectedCategory
      ) {
        return false;
      }

      if (
        audienceFilter === 'customers' &&
        (blueprint.operatorsCount ?? 0) <= 0
      ) {
        return false;
      }

      if (
        audienceFilter === 'operators' &&
        (blueprint.operatorsCount ?? 0) >= 3
      ) {
        return false;
      }

      if (manifestFilter === 'verified' && !hasVerifiedManifest(blueprint)) {
        return false;
      }

      if (manifestFilter === 'fallback' && hasVerifiedManifest(blueprint)) {
        return false;
      }

      if (
        auditFilter === 'audited' &&
        !auditedStatus.get(blueprint.id.toString())
      ) {
        return false;
      }

      return true;
    });
  }, [
    audienceFilter,
    auditFilter,
    auditedStatus,
    blueprintItems,
    deferredSearchQuery,
    manifestFilter,
    selectedCategory,
  ]);

  useEffect(() => {
    setPage(0);
  }, [
    audienceFilter,
    auditFilter,
    deferredSearchQuery,
    manifestFilter,
    selectedCategory,
  ]);

  // Collapse the catalog by metadata identity (publisher.namespace,
  // requestedSlug) AFTER filtering. Running dedupe before filter would
  // mean a filter like "audited only" couldn't surface a sibling mode
  // when the canonical one isn't audited. After filter, the dedupe runs
  // on the survivor set — same set of cards the operator was about to
  // see, just collapsed into one per identity.
  const dedupedRows = useMemo(
    () => dedupeBlueprintsByIdentity(filteredBlueprints),
    [filteredBlueprints],
  );
  const totalPages = Math.max(1, Math.ceil(dedupedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visibleRows = dedupedRows.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== ALL_CATEGORIES ||
    audienceFilter !== 'all' ||
    manifestFilter !== 'all' ||
    auditFilter !== 'all';

  const showSelection =
    typeof rowSelection !== 'undefined' &&
    typeof onRowSelectionChange === 'function';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-[360px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="sandbox" className="border-destructive/20">
        <CardContent className="flex min-h-40 items-center justify-center p-8 text-center">
          <p className="max-w-2xl text-muted-foreground text-sm">
            {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (blueprintItems.length === 0) {
    return (
      <EmptyState
        kind="no-data"
        title="No blueprints on this network"
        description="Register an operator, switch networks, or publish a blueprint to make it available for deployment."
      />
    );
  }

  // Count active non-default filters — drives the FilterTray's active badge
  // so the operator sees at a glance how many constraints they have on.
  const activeFilterCount =
    (audienceFilter !== 'all' ? 1 : 0) +
    (manifestFilter !== 'all' ? 1 : 0) +
    (auditFilter !== 'all' ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(ALL_CATEGORIES);
    setAudienceFilter('all');
    setManifestFilter('all');
    setAuditFilter('all');
  };

  return (
    <div className="space-y-5">
      <PageToolbar
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: 'Search blueprints, services, publishers, or IDs',
        }}
        count={{
          matches: dedupedRows.length,
          total: blueprintItems.length,
          noun: 'matches',
        }}
        trailing={
          <FilterTray
            activeCount={activeFilterCount}
            onClear={resetAllFilters}
            trayTitle="Catalog filters"
          >
            <label className="block space-y-1.5">
              <span className={typeRole.label}>Availability</span>
              <select
                value={audienceFilter}
                onChange={(event) =>
                  setAudienceFilter(event.currentTarget.value as AudienceFilter)
                }
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none hover:bg-[color:var(--bg-hover)] focus:border-[color:var(--border-accent-hover)]"
              >
                <option value="all">All availability</option>
                <option value="customers">Has operators</option>
                <option value="operators">Needs capacity</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className={typeRole.label}>Source</span>
              <select
                value={manifestFilter}
                onChange={(event) =>
                  setManifestFilter(event.currentTarget.value as ManifestFilter)
                }
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none hover:bg-[color:var(--bg-hover)] focus:border-[color:var(--border-accent-hover)]"
              >
                <option value="all">All sources</option>
                <option value="verified">Pinned source</option>
                <option value="fallback">Chain-only</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className={typeRole.label}>Trust</span>
              <select
                value={auditFilter}
                onChange={(event) =>
                  setAuditFilter(event.currentTarget.value as AuditFilter)
                }
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none hover:bg-[color:var(--bg-hover)] focus:border-[color:var(--border-accent-hover)]"
              >
                <option value="all">All blueprints</option>
                <option value="audited">Audited only</option>
              </select>
            </label>
          </FilterTray>
        }
      />

      {/* Category strip — a thin row above the grid. Not wrapped in a card,
       * not bordered. Categories live on-chain when present; otherwise they
       * fall back to the regex-derived buckets in getBlueprintCategory until
       * the metadata schema grows `blueprintUi.tags[]`. */}
      <div className="overflow-x-auto pb-0.5">
        <SegmentedControl<string>
          aria-label="Filter blueprints by category"
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          options={[
            {
              value: ALL_CATEGORIES,
              label: 'All',
              adornment: (
                <span className="rounded-full bg-background/70 px-2 py-0.5 font-mono text-[10px] text-foreground">
                  {blueprintItems.length}
                </span>
              ),
            } satisfies SegmentedControlOption<string>,
            ...categories.map(
              ({ category, count }) =>
                ({
                  value: category,
                  label: category.replace(/^AI /, ''),
                  adornment: (
                    <span className="rounded-full bg-background/70 px-2 py-0.5 font-mono text-[10px] text-foreground">
                      {count}
                    </span>
                  ),
                }) satisfies SegmentedControlOption<string>,
            ),
          ]}
        />
      </div>

      {dedupedRows.length === 0 ? (
        <EmptyState
          kind="no-match"
          description="Try a broader category, remove the source filter, or search by the blueprint name, publisher, or protocol ID."
          primary={
            hasActiveFilters && (
              <Button onClick={resetAllFilters}>Clear all filters</Button>
            )
          }
        />
      ) : (
        <div className="results-grid grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleRows.map((row) => (
            <BlueprintCard
              key={row.blueprint.id.toString()}
              row={row}
              isSelectable={showSelection}
              isSelected={rowSelection?.[row.blueprint.id.toString()] === true}
              isAudited={
                auditedStatus.get(row.blueprint.id.toString()) ?? false
              }
              onSelectionChange={(isSelected) => {
                onRowSelectionChange?.((previous) => ({
                  ...previous,
                  [row.blueprint.id.toString()]: isSelected,
                }));
              }}
              onRegister={onRegisterBlueprint}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 border-border border-t pt-4 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {dedupedRows.length === 0 ? 0 : safePage * PAGE_SIZE + 1}-
          {Math.min((safePage + 1) * PAGE_SIZE, dedupedRows.length)} of{' '}
          {dedupedRows.length} {pluralize('blueprint', dedupedRows.length)}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Previous
          </Button>

          <span className="px-2 font-mono text-muted-foreground text-xs">
            {safePage + 1}/{totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages - 1}
            onClick={() =>
              setPage((current) => Math.min(totalPages - 1, current + 1))
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

BlueprintListing.displayName = 'BlueprintListing';

export default BlueprintListing;

/**
 * Per-blueprint audited-status fetcher. For each id, reads the active
 * version + that version's attestation list, then determines whether at
 * least one non-revoked, non-expired, non-SELF attestation came from a
 * known active auditor.
 *
 * Returns a Map<idString, boolean> so the parent filter can stay synchronous.
 *
 * Each query is keyed identically to `useBlueprintTrust` in
 * `BlueprintTrustChip.tsx`, so the card chip + the listing filter share
 * the same react-query cache entry — no duplicate chain reads.
 */
const useAuditedStatusMap = (blueprintIds: bigint[]): Map<string, boolean> => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const fallback = useMemo(() => auditorFallbackRegistry(), []);

  const queries = useQueries({
    queries: blueprintIds.map((blueprintId) => ({
      queryKey: ['tangle', 'blueprint-trust', chainId, blueprintId.toString()],
      queryFn: async (): Promise<{
        score: number;
        hasCriticalFinding: boolean;
        hasAuditedAttestation: boolean;
        attestationCount: number;
      }> => {
        if (!publicClient) {
          return {
            score: 0,
            hasCriticalFinding: false,
            hasAuditedAttestation: false,
            attestationCount: 0,
          };
        }
        let tangle: Address;
        try {
          tangle = getContractsByChainId(chainId).tangle as Address;
        } catch {
          return {
            score: 0,
            hasCriticalFinding: false,
            hasAuditedAttestation: false,
            attestationCount: 0,
          };
        }
        const [count, activeId] = await Promise.all([
          publicClient.readContract({
            address: tangle,
            abi: BinaryUpgradeABI,
            functionName: 'getBinaryVersionCount',
            args: [blueprintId],
          }) as Promise<bigint>,
          publicClient.readContract({
            address: tangle,
            abi: BinaryUpgradeABI,
            functionName: 'getActiveBinaryVersionId',
            args: [blueprintId],
          }) as Promise<bigint>,
        ]);
        if (count === 0n) {
          return {
            score: 0,
            hasCriticalFinding: false,
            hasAuditedAttestation: false,
            attestationCount: 0,
          };
        }
        const attestations = await fetchAttestations(
          publicClient,
          chainId,
          blueprintId,
          BigInt(activeId),
        );
        if (attestations.length === 0) {
          return {
            score: 0,
            hasCriticalFinding: false,
            hasAuditedAttestation: false,
            attestationCount: 0,
          };
        }
        const uniqueAttesters = Array.from(
          new Set(attestations.map((a) => a.attester.toLowerCase())),
        ) as Address[];
        const auditors = await Promise.all(
          uniqueAttesters.map(async (address): Promise<Auditor | null> => {
            const onChain = await fetchAuditorOnChain(
              publicClient,
              chainId,
              address,
            );
            if (onChain !== null && onChain.active) return onChain;
            const entry = fallback[address];
            if (entry) {
              return {
                name: entry.name,
                metadataUri: entry.metadataUri,
                weight: entry.weight,
                tier: entry.tier,
                active: entry.active,
                admittedAt: 0n,
              };
            }
            return onChain;
          }),
        );
        const auditorMap = new Map<string, Auditor | null>();
        uniqueAttesters.forEach((address, idx) => {
          auditorMap.set(address, auditors[idx] ?? null);
        });
        const nowSeconds = Math.floor(Date.now() / 1000);
        const hasAuditedAttestation = attestations.some((row) => {
          if (row.revoked) return false;
          if (row.expiresAt !== 0n && Number(row.expiresAt) <= nowSeconds) {
            return false;
          }
          if (row.kind === AttestationKind.SELF) return false;
          const auditor = auditorMap.get(row.attester.toLowerCase());
          return auditor !== null && auditor !== undefined && auditor.active;
        });
        return {
          score: 0,
          hasCriticalFinding: false,
          hasAuditedAttestation,
          attestationCount: attestations.length,
        };
      },
      enabled: publicClient !== undefined,
      staleTime: 60_000,
    })),
  });

  const map = new Map<string, boolean>();
  blueprintIds.forEach((id, idx) => {
    map.set(id.toString(), queries[idx]?.data?.hasAuditedAttestation ?? false);
  });
  return map;
};

const BlueprintCard = ({
  row,
  isSelectable,
  isSelected,
  isAudited,
  onSelectionChange,
  onRegister,
}: {
  row: DedupedBlueprintRow;
  isSelectable: boolean;
  isSelected: boolean;
  isAudited: boolean;
  onSelectionChange: (isSelected: boolean) => void;
  onRegister?: (blueprint: Blueprint) => void;
}) => {
  const { blueprint, aliases, modes } = row;
  // Count of *sibling* deployments. The canonical blueprint itself is the
  // first mode; the picker shows it plus each alias. The subtitle reads
  // "N deployment modes" only when there's actually a picker to surface.
  const deploymentModeCount =
    modes && modes.length > 1
      ? modes.length
      : aliases.length > 0
        ? aliases.length + 1
        : 0;
  const description =
    blueprint.description ??
    'A Tangle service blueprint. Customers can deploy an instance when operators are available; operators can register to supply capacity.';
  const blueprintHref = `${PagePath.BLUEPRINTS}/${blueprint.id.toString()}`;
  const manifestStatus = hasVerifiedManifest(blueprint)
    ? 'Pinned source'
    : 'Chain-only';
  const category = getBlueprintCategory(blueprint);
  const operatorCount = blueprint.operatorsCount ?? 0;
  const hasOperators = operatorCount > 0;
  const capacityLabel =
    operatorCount === 0
      ? 'No operators'
      : `${operatorCount} ${pluralize('operator', operatorCount)}`;
  const deploymentState = hasOperators
    ? 'Ready to instance'
    : 'Needs operator capacity';
  const displayName = formatBlueprintName(blueprint.name);
  // Featured = boosted or audited. Featured cards get a brand-tinted ring +
  // a top-right ribbon so they pop out of the wall instead of blending in.
  const isFeatured = blueprint.isBoosted === true || isAudited;
  const featuredLabel = blueprint.isBoosted
    ? 'Featured'
    : isAudited
      ? 'Audited'
      : null;
  return (
    <Card
      variant="sandbox"
      hover
      className={twMerge(
        'blueprint-card group relative min-h-[360px] overflow-hidden',
        isFeatured &&
          'border-[color:var(--border-accent)] shadow-[var(--shadow-accent),0_0_0_1px_var(--border-accent)]',
        isSelected && 'border-primary shadow-[var(--shadow-accent)]',
      )}
      style={categoryStripeStyle(category)}
    >
      <Link
        to={blueprintHref}
        className="absolute inset-0 z-10"
        aria-label={`Open ${blueprint.name}`}
      />

      {featuredLabel && (
        <div
          className="pointer-events-none absolute right-3 top-3 z-20 rounded-full border bg-[var(--accent-surface-soft)] px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider"
          style={{
            borderColor: 'var(--border-accent)',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {blueprint.isBoosted ? '★ ' : '✓ '}
          {featuredLabel}
        </div>
      )}

      <CardContent className="relative flex h-full min-h-[360px] flex-col p-5">
        <BlueprintVisual blueprint={blueprint} category={category} compact />

        <div className="mt-4">
          <span
            className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-[0.18em]"
            style={categoryBadgeStyle(category)}
          >
            {category}
          </span>
          <h3 className="mt-2 line-clamp-1 font-display font-extrabold text-foreground text-xl tracking-tight">
            {displayName}
          </h3>
          <p className="mt-1 truncate font-mono text-muted-foreground text-[11px]">
            by {shortenIdentity(blueprint.author)}
          </p>
          {deploymentModeCount > 1 && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-border bg-[var(--bg-elevated)] px-2 py-0.5 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
              {deploymentModeCount} deployment modes
            </p>
          )}
        </div>

        {isSelectable && (
          <label
            className="absolute right-7 top-7 z-20 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-card/80 backdrop-blur transition-colors hover:bg-card"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="sr-only">Select {blueprint.name}</span>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(event) => onSelectionChange(event.target.checked)}
              className="h-4 w-4 accent-[var(--brand-primary)]"
            />
          </label>
        )}

        <p className="mt-3 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span
            className={twMerge(
              'rounded-full border px-2.5 py-1 font-semibold text-[10px] uppercase tracking-wider',
              hasOperators
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-300',
            )}
          >
            {deploymentState}
          </span>
          <span className="rounded-full border border-border bg-[var(--bg-elevated)] px-2.5 py-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
            {capacityLabel}
          </span>
          {!isAudited && (
            // AuditedPill / TrustChip already show in the metadata row below
            // for audited blueprints. Skip them in the chip row to reduce
            // visual noise on already-featured cards.
            <>
              <AuditedPill blueprintId={blueprint.id} />
              <BlueprintTrustChip blueprintId={blueprint.id} />
            </>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="grid grid-cols-3 gap-2 border-border border-t pt-4">
            <BlueprintMetric
              label="Operators"
              value={blueprint.operatorsCount}
            />
            <BlueprintMetric
              label="Instances"
              value={blueprint.instancesCount}
            />
            <BlueprintMetric label="Source" value={manifestStatus} />
          </div>

          <div className="actions relative z-20 mt-4 grid grid-cols-2 gap-2">
            {hasOperators ? (
              <>
                <Link
                  to={`${blueprintHref}/deploy`}
                  className="primary rounded-md bg-primary px-3 py-3 text-center font-bold text-primary-foreground text-sm transition-colors hover:bg-primary/90"
                >
                  Create instance
                </Link>
                <RegisterCapacityButton
                  blueprint={blueprint}
                  onRegister={onRegister}
                />
              </>
            ) : (
              <>
                <RegisterCapacityButton
                  blueprint={blueprint}
                  onRegister={onRegister}
                  isPrimary
                />
                <Link
                  to={blueprintHref}
                  className="rounded-md border border-border bg-transparent px-3 py-3 text-center font-semibold text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                >
                  View details
                </Link>
              </>
            )}
            {blueprint.githubUrl && (
              <a
                href={blueprint.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-link relative z-20 col-span-2 rounded-md px-3 py-2 text-center font-semibold text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
                onClick={(event) => event.stopPropagation()}
              >
                Source on GitHub
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RegisterCapacityButton = ({
  blueprint,
  onRegister,
  isPrimary = false,
}: {
  blueprint: Blueprint;
  onRegister?: (blueprint: Blueprint) => void;
  isPrimary?: boolean;
}) => (
  <button
    type="button"
    className={twMerge(
      'rounded-md px-3 py-3 font-semibold text-sm transition-colors',
      isPrimary
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'border border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
    )}
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onRegister?.(blueprint);
    }}
  >
    Register capacity
  </button>
);

const BlueprintMetric = ({
  label,
  value,
}: {
  label: string;
  value: number | string | null | undefined;
}) => (
  <div>
    <p className="font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
      {label}
    </p>
    <p className="mt-1 font-display font-extrabold text-foreground text-lg">
      {value ?? '-'}
    </p>
  </div>
);

import type { RowSelectionState } from '@tanstack/table-core';
import {
  Button,
  Card,
  CardContent,
  Skeleton,
} from '../../components/sandbox/SandboxUi';
import { formatBlueprintName } from '../../components/blueprints/blueprintVisualUtils';
import {
  EmptyState,
  FilterTray,
  PageToolbar,
  ResultList,
  StatusPill,
  ViewToggle,
  statusToneFor,
  type ResultView,
} from '../../components/chrome';
import {
  enumCodec,
  intCodec,
  stringCodec,
  useUrlState,
} from '../../components/chrome/useUrlState';
import { focus, typeRole } from '../../styles/chrome';
import type { UseAllBlueprintsReturn } from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
} from 'react';
import * as Popover from '@radix-ui/react-popover';
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
import { Link, useNavigate } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { PagePath } from '../../types';
import {
  dedupeBlueprintsByIdentity,
  type DedupedBlueprintRow,
} from '../../blueprintApps/dedupe';

const PAGE_SIZE = 12;

type AudienceFilter = 'all' | 'customers' | 'operators';
type ManifestFilter = 'all' | 'verified' | 'fallback';
type AuditFilter = 'all' | 'audited';

type Props = {
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: Dispatch<SetStateAction<RowSelectionState>>;
  onRegisterBlueprint?: (blueprint: Blueprint) => void;
} & Omit<UseAllBlueprintsReturn, 'refetch'>;

const pluralize = (label: string, count: number) =>
  count === 1 ? label : `${label}s`;

/**
 * Title-case a single tag so the catalog renders consistent chips even if
 * the publisher's on-chain string is lowercase or mixed-case ("inference"
 * vs "Inference" vs "INFERENCE" all render as "Inference").
 */
const normalizeTag = (raw: string): string => {
  const t = raw.trim();
  if (t.length === 0) return '';
  // Preserve all-caps acronyms (TEE, LLM, RAG, ZK, AI, MEV).
  if (/^[A-Z]{2,5}$/.test(t)) return t;
  return t
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Resolve a blueprint's category in three tiers, in order:
 *
 *   1. `blueprintUi.tags[0]` — publisher-declared, on-chain, authoritative.
 *      Multi-tag blueprints surface the first as the primary chip.
 *   2. `blueprint.category` — chain-derived, present on older metadata.
 *   3. Keyword inference from name + description — last resort.
 *
 * The keyword fallback is a fingerprint, not a taxonomy. It's narrow on
 * purpose: misclassifying a blueprint into the wrong bucket is worse than
 * dropping it into "Other" and asking the publisher to declare tags.
 */
const getBlueprintCategory = (blueprint: Blueprint): string => {
  const declaredTags = blueprint.blueprintUi?.tags ?? [];
  for (const raw of declaredTags) {
    const normalized = normalizeTag(raw);
    if (normalized.length > 0) return normalized;
  }

  const explicitCategory = blueprint.category?.trim();
  if (explicitCategory) {
    return normalizeTag(explicitCategory);
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

/**
 * Full tag set for a blueprint — all publisher-declared tags + the primary
 * category (so search/filter still matches on the inferred bucket when the
 * publisher didn't declare it explicitly).
 */
const getBlueprintTags = (blueprint: Blueprint): readonly string[] => {
  const declared = (blueprint.blueprintUi?.tags ?? [])
    .map(normalizeTag)
    .filter((t) => t.length > 0);
  if (declared.length > 0) return declared;
  return [getBlueprintCategory(blueprint)];
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
    // Match against every declared tag, not just the primary category —
    // a search for "tee" should hit a blueprint tagged ["Inference", "TEE"]
    // even though its primary chip says Inference.
    ...getBlueprintTags(blueprint),
    blueprint.id.toString(),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
};

/**
 * Multi-select category dropdown for the toolbar. Replaces the old
 * full-width segmented row — categories collapse into one pill with a
 * checkbox list, so search + categories + filters fit a single toolbar row.
 */
const CategoryFilterMenu: FC<{
  categories: { category: string; count: number }[];
  selected: string[];
  onToggle: (category: string) => void;
  onClear: () => void;
}> = ({ categories, selected, onToggle, onClear }) => {
  const count = selected.length;
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={twMerge(
            'inline-flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-medium text-foreground transition-colors hover:bg-[color:var(--bg-hover)]',
            focus.ring,
          )}
        >
          <span>Categories</span>
          {count > 0 && (
            <span
              className={twMerge(
                typeRole.mono,
                'flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--border-accent)] px-1.5 text-[11px] text-foreground',
              )}
            >
              {count}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className={twMerge(
            'z-50 max-h-[60vh] w-64 overflow-y-auto rounded-lg border border-border bg-[color:var(--bg-card)] p-2 shadow-[var(--shadow-dropdown)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
        >
          <div className="mb-1 flex items-center justify-between px-2 py-1">
            <span className={typeRole.label}>Categories</span>
            {count > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          {categories.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              No categories
            </p>
          ) : (
            categories.map(({ category, count: c }) => {
              const checked = selected.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onToggle(category)}
                  className={twMerge(
                    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-[color:var(--bg-hover)]',
                    focus.ring,
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={twMerge(
                        'flex h-4 w-4 items-center justify-center rounded border border-border text-[10px] leading-none',
                        checked &&
                          'border-[color:var(--border-accent-hover)] bg-[color:var(--border-accent)]',
                      )}
                    >
                      {checked ? '✓' : ''}
                    </span>
                    {category}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {c}
                  </span>
                </button>
              );
            })
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const BlueprintListing: FC<Props> = ({
  rowSelection,
  onRowSelectionChange,
  blueprints,
  isLoading,
  error,
  onRegisterBlueprint,
}) => {
  const navigate = useNavigate();
  // Filter state lives in the URL — refresh persists the view, deep-links are
  // shareable, the back button works. Defaults are omitted from the URL so a
  // bare /blueprints stays clean. `replace: true` (in `useUrlState`) means
  // every keystroke doesn't pollute the history stack.
  const [page, setPage] = useUrlState('page', intCodec(0));
  const [searchQuery, setSearchQuery] = useUrlState('q', stringCodec(''));
  const [view, setView] = useUrlState<ResultView>(
    'view',
    enumCodec(['grid', 'list'] as const, 'list'),
  );
  // Multi-select categories, comma-joined in the URL (empty = all). Single
  // dropdown in the toolbar replaces the old full-width category row.
  const [categoryParam, setCategoryParam] = useUrlState(
    'category',
    stringCodec(''),
  );
  const selectedCategories = useMemo(
    () => (categoryParam ? categoryParam.split(',').filter(Boolean) : []),
    [categoryParam],
  );
  const toggleCategory = useCallback(
    (category: string) => {
      const next = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category];
      setCategoryParam(next.join(','));
    },
    [selectedCategories, setCategoryParam],
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
      if (a.id === b.id) return 0;
      return a.id < b.id ? 1 : -1;
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
        selectedCategories.length > 0 &&
        !selectedCategories.includes(getBlueprintCategory(blueprint))
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
    selectedCategories,
  ]);

  // `useUrlState` returns a new setter each render; depending on it creates a
  // page-reset loop. Filter values are the actual synchronization boundary.
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    audienceFilter,
    auditFilter,
    deferredSearchQuery,
    manifestFilter,
    categoryParam,
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
    selectedCategories.length > 0 ||
    audienceFilter !== 'all' ||
    manifestFilter !== 'all' ||
    auditFilter !== 'all';

  const showSelection =
    typeof rowSelection !== 'undefined' &&
    typeof onRowSelectionChange === 'function';
  const effectiveView = showSelection ? 'grid' : view;

  const listColumns = useMemo(
    () => [
      {
        header: 'Blueprint',
        className: 'min-w-0 flex-[2]',
        render: (row: DedupedBlueprintRow) => {
          const { blueprint } = row;
          const description =
            blueprint.description?.trim() ||
            'Service blueprint — deploy when operators are available.';

          return (
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate font-display font-bold text-foreground text-sm">
                  {formatBlueprintName(blueprint.name)}
                </span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                  #{blueprint.id.toString()}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs">
                {description}
              </p>
            </div>
          );
        },
      },
      {
        header: 'Operators',
        className: 'w-44',
        render: (row: DedupedBlueprintRow) => (
          <BlueprintCapacityPill
            operatorCount={row.blueprint.operatorsCount ?? 0}
          />
        ),
      },
      {
        header: 'Trust',
        className: 'w-28',
        hideBelow: 'md' as const,
        render: (row: DedupedBlueprintRow) => {
          const audited =
            auditedStatus.get(row.blueprint.id.toString()) ?? false;
          return (
            <StatusPill
              tone={statusToneFor('audit', audited ? 'Audited' : 'Unaudited')}
              dot={audited}
            >
              {audited ? 'Audited' : 'Unaudited'}
            </StatusPill>
          );
        },
      },
      {
        header: 'Instances',
        className: 'w-28 justify-end',
        hideBelow: 'lg' as const,
        render: (row: DedupedBlueprintRow) => (
          <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
            {(row.blueprint.instancesCount ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        header: 'Actions',
        className: 'w-48 justify-end',
        render: (row: DedupedBlueprintRow) => {
          const { blueprint } = row;
          const blueprintHref = `${PagePath.BLUEPRINTS}/${blueprint.id.toString()}`;
          const hasOperators = (blueprint.operatorsCount ?? 0) > 0;

          return (
            <div className="flex w-full justify-end gap-2">
              {hasOperators && (
                <Link
                  to={`${blueprintHref}/deploy`}
                  onClick={(event) => event.stopPropagation()}
                  className="rounded-md bg-primary px-2.5 py-1.5 text-center font-semibold text-primary-foreground text-xs transition-colors hover:bg-primary/90"
                >
                  Deploy
                </Link>
              )}
              <RegisterCapacityButton
                blueprint={blueprint}
                onRegister={onRegisterBlueprint}
                isPrimary={!hasOperators}
              />
            </div>
          );
        },
      },
    ],
    [auditedStatus, onRegisterBlueprint],
  );

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
    setCategoryParam('');
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
          <div className="flex flex-wrap items-center gap-2">
            {!showSelection && <ViewToggle value={view} onChange={setView} />}
            <CategoryFilterMenu
              categories={categories}
              selected={selectedCategories}
              onToggle={toggleCategory}
              onClear={() => setCategoryParam('')}
            />
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
                    setAudienceFilter(
                      event.currentTarget.value as AudienceFilter,
                    )
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
                    setManifestFilter(
                      event.currentTarget.value as ManifestFilter,
                    )
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
          </div>
        }
      />

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
      ) : effectiveView === 'list' ? (
        <ResultList
          items={visibleRows}
          columns={listColumns}
          rowKey={(row) => row.blueprint.id.toString()}
          onRowClick={(row) =>
            navigate(`${PagePath.BLUEPRINTS}/${row.blueprint.id.toString()}`)
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
          if (row.expiresAt !== 0n && row.expiresAt <= BigInt(nowSeconds)) {
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

const BlueprintCapacityPill = ({
  operatorCount,
}: {
  operatorCount: number;
}) => {
  const hasOperators = operatorCount > 0;

  return (
    <StatusPill
      tone={statusToneFor(
        'availability',
        hasOperators ? 'Available' : 'Limited',
      )}
      className="text-[10px] uppercase tracking-wider"
    >
      {hasOperators ? (
        <>
          <span className="font-mono tabular-nums">{operatorCount}</span>{' '}
          {pluralize('operator', operatorCount)}
        </>
      ) : (
        'Needs operators'
      )}
    </StatusPill>
  );
};

/**
 * Catalog card — the operator/customer's primary scan surface.
 *
 * Hard rule: ONE fact per visual line, three lines of information total.
 *
 *   Line 1: title (large, primary read)
 *   Line 2: one-line description (truncated)
 *   Line 3: status — "Ready · N operators" OR "Needs operators"
 *
 * Everything else is hover-revealed (action buttons) or absent (publisher
 * address, category pill, deployment-modes pill, source-pinning pill,
 * three-cell metric grid, github link). The detail page is one click away
 * and surfaces those facts where they belong.
 *
 * Distinctive identity (so the wall doesn't look like a shadcn template
 * gallery): the blueprint id renders as a large mono "watermark" in the
 * top-right corner — like a tactical card chip number. Featured /
 * audited blueprints get a 2px accent stripe on the left border, not a
 * full perimeter glow. Visual identity comes from typography and
 * proportion, not from gradients.
 */
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
  const { blueprint } = row;
  const description =
    blueprint.description?.trim() ||
    'Service blueprint — deploy when operators are available.';
  const blueprintHref = `${PagePath.BLUEPRINTS}/${blueprint.id.toString()}`;
  const operatorCount = blueprint.operatorsCount ?? 0;
  const hasOperators = operatorCount > 0;
  const isFeatured = blueprint.isBoosted === true || isAudited;
  const displayName = formatBlueprintName(blueprint.name);
  return (
    <div
      className={twMerge(
        'group relative flex min-h-[180px] flex-col gap-3 rounded-lg border border-border bg-[color:var(--bg-card)] p-5 transition-all',
        // Subtle hover: lift one pixel, tighten border accent. No gradient
        // glow. The card already has enough visual weight from its content.
        'hover:-translate-y-px hover:border-[color:var(--border-accent-hover)]',
        isFeatured && 'border-l-2 border-l-[color:var(--border-accent-hover)]',
        isSelected &&
          'border-[color:var(--border-accent-hover)] shadow-[0_0_0_1px_var(--border-accent-hover)]',
      )}
    >
      {/* Whole-card link — keeps the deploy/register buttons interactive
       * because they have z-20 and stopPropagation. Aria label on the
       * link is the source of truth; the visible title is a styled span. */}
      <Link
        to={blueprintHref}
        className="absolute inset-0 z-10"
        aria-label={`Open ${blueprint.name}`}
      />

      {/* Watermark ID — mono, low-contrast, top-right. The card's identity
       * marker; not a UI element, not actionable. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-4 select-none font-mono text-xs tabular-nums text-foreground/15"
      >
        #{blueprint.id.toString().padStart(3, '0')}
      </span>

      {/* Selection checkbox (drawer mode) — top-left so it never collides
       * with the watermark or with the hover-revealed actions. */}
      {isSelectable && (
        <label
          className="absolute left-4 top-4 z-20 flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-border bg-background/80 backdrop-blur transition-colors hover:bg-background"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="sr-only">Select {blueprint.name}</span>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(event) => onSelectionChange(event.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--border-accent-hover)]"
          />
        </label>
      )}

      {/* Header — name + 1-line description. */}
      <div className={twMerge('min-w-0', isSelectable && 'pl-8')}>
        <h3 className="line-clamp-1 pr-12 font-display font-bold text-base leading-tight tracking-tight text-foreground">
          {displayName}
        </h3>
        <p className="mt-1 line-clamp-2 pr-12 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Status row — one chip, mono operator count, audit/trust if present.
       * Everything is bottom-anchored so cards align by their last line. */}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        <BlueprintCapacityPill operatorCount={operatorCount} />
        {isAudited && (
          <StatusPill
            tone={statusToneFor('audit', 'Audited')}
            className="text-[10px] uppercase tracking-wider"
          >
            Audited
          </StatusPill>
        )}
        {(blueprint.instancesCount ?? 0) > 0 && (
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {blueprint.instancesCount} instances
          </span>
        )}
      </div>

      {/* Hover-revealed actions. Hidden by default — single click on the
       * card opens the detail page; the actions are for power-users who
       * want to jump straight to deploy/register without the detail step.
       * `z-20` + `stopPropagation` keeps them clickable inside the overlay
       * link.
       *
       * On non-hover devices (touch) the actions are always visible — the
       * `group-hover:` selector only matches on pointer hover, so this is
       * automatic. */}
      <div
        className={twMerge(
          'actions relative z-20 mt-2 flex gap-2 opacity-0 transition-opacity',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          // Always visible on touch — `pointer: coarse` means no hover layer.
          '[@media(pointer:coarse)]:opacity-100',
        )}
      >
        {hasOperators ? (
          <>
            <Link
              to={`${blueprintHref}/deploy`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 rounded-md bg-primary px-2 py-1.5 text-center text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Deploy
            </Link>
            <RegisterCapacityButton
              blueprint={blueprint}
              onRegister={onRegister}
            />
          </>
        ) : (
          <RegisterCapacityButton
            blueprint={blueprint}
            onRegister={onRegister}
            isPrimary
          />
        )}
      </div>
    </div>
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
      'flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors',
      isPrimary
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'border border-border bg-transparent text-muted-foreground hover:bg-[color:var(--bg-hover)] hover:text-foreground',
    )}
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onRegister?.(blueprint);
    }}
  >
    Register
  </button>
);

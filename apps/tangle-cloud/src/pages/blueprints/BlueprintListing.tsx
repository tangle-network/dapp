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
  ReactNode,
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
import { BlueprintVisual } from '../../components/blueprints/BlueprintVisual';

const PAGE_SIZE = 12;

type AvailabilityFilter = 'all' | 'deployable' | 'capacity';
type ManifestFilter = 'all' | 'verified' | 'fallback';
type AuditFilter = 'all' | 'audited';
type FilterOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};
type CatalogStat = {
  label: string;
  value: number;
  detail: string;
};

type Props = {
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: Dispatch<SetStateAction<RowSelectionState>>;
  onRegisterBlueprint?: (blueprint: Blueprint) => void;
  toolbarAction?: ReactNode;
  onRetry?: () => void;
} & Omit<UseAllBlueprintsReturn, 'refetch'>;

const pluralize = (label: string, count: number) =>
  count === 1 ? label : `${label}s`;

const availabilityOptions: FilterOption<AvailabilityFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'deployable', label: 'Deployable' },
  { value: 'capacity', label: 'Needs capacity' },
];

const sourceOptions: FilterOption<ManifestFilter>[] = [
  { value: 'all', label: 'All sources' },
  { value: 'verified', label: 'Pinned source' },
  { value: 'fallback', label: 'Chain-only' },
];

const trustOptions: FilterOption<AuditFilter>[] = [
  { value: 'all', label: 'All trust' },
  { value: 'audited', label: 'Audited' },
];

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

const getBlueprintDescription = (blueprint: Blueprint) =>
  blueprint.description?.trim() ||
  'Service blueprint ready for deployment once capacity is available.';

const getModeCount = (row: DedupedBlueprintRow) =>
  row.modes?.length ?? (row.aliases.length > 0 ? row.aliases.length + 1 : 1);

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
            'inline-flex h-9 items-center gap-2 rounded-md border border-border bg-muted/30 px-3 font-sans text-sm font-medium text-foreground not-italic transition-colors hover:bg-[color:var(--bg-hover)]',
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
                className="font-sans text-xs text-muted-foreground not-italic hover:text-foreground"
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
                    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left font-sans text-sm text-foreground not-italic transition-colors hover:bg-[color:var(--bg-hover)]',
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

const BlueprintCatalogHeader: FC<{
  matchCount: number;
  totalCount: number;
  stats: CatalogStat[];
}> = ({ matchCount, totalCount, stats }) => (
  <section className="border-b border-border pb-5">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <h1 className={twMerge(typeRole.display, 'text-foreground')}>
          Blueprints
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Live service catalog with capacity, source, and trust signals for the
          selected network.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className={typeRole.mono}>
            {matchCount.toLocaleString()}
            {matchCount !== totalCount && (
              <span className="opacity-60">
                {' / '}
                {totalCount.toLocaleString()}
              </span>
            )}
          </span>
          <span>{pluralize('blueprint', matchCount)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:min-w-[520px]">
        {stats.map((stat) => (
          <div key={stat.label} className="border-l border-border pl-3">
            <div className="font-mono text-2xl leading-none tabular-nums text-foreground">
              {stat.value.toLocaleString()}
            </div>
            <div className={twMerge(typeRole.label, 'mt-1')}>{stat.label}</div>
            <div className="mt-1 text-xs leading-tight text-muted-foreground">
              {stat.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

function FilterSegment<T extends string>({
  label,
  options,
  value,
  onChange,
  stacked = false,
}: {
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  stacked?: boolean;
}) {
  return (
    <div className={twMerge(stacked ? 'space-y-2' : 'flex items-center gap-2')}>
      {stacked && <span className={typeRole.label}>{label}</span>}
      <div
        role="radiogroup"
        aria-label={label}
        className={twMerge(
          'inline-flex min-h-9 rounded-md border border-border bg-muted/30 p-0.5',
          stacked && 'grid w-full grid-cols-1 gap-1 bg-transparent p-0',
        )}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={twMerge(
                'inline-flex min-h-8 items-center justify-center rounded px-3 font-sans text-sm font-medium not-italic transition-colors',
                active
                  ? 'bg-[color:var(--bg-hover)] text-foreground shadow-[inset_0_0_0_1px_var(--border-accent)]'
                  : 'text-muted-foreground hover:text-foreground',
                stacked && 'justify-start border border-border bg-muted/20',
                stacked &&
                  active &&
                  'border-[color:var(--border-accent-hover)]',
                focus.ring,
              )}
            >
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const BlueprintListing: FC<Props> = ({
  rowSelection,
  onRowSelectionChange,
  blueprints,
  isLoading,
  error,
  onRegisterBlueprint,
  toolbarAction,
  onRetry,
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
  const [availabilityFilter, setAvailabilityFilter] =
    useUrlState<AvailabilityFilter>(
      'avail',
      enumCodec(['all', 'deployable', 'capacity'] as const, 'all'),
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
        availabilityFilter === 'deployable' &&
        (blueprint.operatorsCount ?? 0) <= 0
      ) {
        return false;
      }

      if (
        availabilityFilter === 'capacity' &&
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
    availabilityFilter,
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
    availabilityFilter,
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
  const allDedupedRows = useMemo(
    () => dedupeBlueprintsByIdentity(blueprintItems),
    [blueprintItems],
  );
  const catalogStats = useMemo<CatalogStat[]>(() => {
    let deployable = 0;
    let capacityNeeded = 0;
    let pinnedSource = 0;
    let audited = 0;

    for (const { blueprint } of allDedupedRows) {
      const operatorCount = blueprint.operatorsCount ?? 0;
      if (operatorCount > 0) deployable += 1;
      if (operatorCount < 3) capacityNeeded += 1;
      if (hasVerifiedManifest(blueprint)) pinnedSource += 1;
      if (auditedStatus.get(blueprint.id.toString()) === true) audited += 1;
    }

    return [
      {
        label: 'Deployable',
        value: deployable,
        detail: 'ready now',
      },
      {
        label: 'Need capacity',
        value: capacityNeeded,
        detail: 'below target',
      },
      {
        label: 'Pinned',
        value: pinnedSource,
        detail: 'verified source',
      },
      {
        label: 'Audited',
        value: audited,
        detail: 'trust signal',
      },
    ];
  }, [allDedupedRows, auditedStatus]);
  const totalPages = Math.max(1, Math.ceil(dedupedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visibleRows = dedupedRows.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategories.length > 0 ||
    availabilityFilter !== 'all' ||
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
        className: 'min-w-0 flex-[2.4]',
        render: (row: DedupedBlueprintRow) => (
          <BlueprintIdentitySummary row={row} />
        ),
      },
      {
        header: 'Capacity',
        className: 'w-40',
        hideBelow: 'md' as const,
        render: (row: DedupedBlueprintRow) => (
          <BlueprintCapacityCell
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
              dot={false}
            >
              {audited ? 'Audited' : 'Unaudited'}
            </StatusPill>
          );
        },
      },
      {
        header: 'Source',
        className: 'w-32',
        hideBelow: 'lg' as const,
        render: (row: DedupedBlueprintRow) => {
          const verified = hasVerifiedManifest(row.blueprint);
          return (
            <StatusPill
              tone={verified ? 'success' : 'neutral'}
              dot={false}
              className="text-[12px]"
            >
              {verified ? 'Pinned' : 'Chain-only'}
            </StatusPill>
          );
        },
      },
      {
        header: 'Usage',
        className: 'w-24 justify-end',
        hideBelow: 'lg' as const,
        render: (row: DedupedBlueprintRow) => (
          <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
            {(row.blueprint.instancesCount ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        header: 'Actions',
        className: 'w-52 justify-end sm:w-56',
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
                  className={catalogPrimaryActionClass}
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

  if (isLoading && blueprintItems.length === 0) {
    return (
      <div className="space-y-5">
        <BlueprintCatalogHeader
          matchCount={0}
          totalCount={0}
          stats={catalogStats}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-[360px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && blueprintItems.length === 0) {
    return (
      <Card variant="sandbox" className="border-destructive/20">
        <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 p-8 text-center">
          <div>
            <p className="font-semibold text-foreground">
              Unable to refresh blueprints
            </p>
            <p className="mt-1 max-w-2xl text-muted-foreground text-sm">
              {error.message}
            </p>
          </div>
          {onRetry !== undefined && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (blueprintItems.length === 0) {
    return (
      <EmptyState
        kind="no-data"
        title="No blueprints on this network"
        description="Add capacity, switch networks, or publish a blueprint to make services available for deployment."
      />
    );
  }

  const trayFilterCount =
    (manifestFilter !== 'all' ? 1 : 0) + (auditFilter !== 'all' ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setCategoryParam('');
    setAvailabilityFilter('all');
    setManifestFilter('all');
    setAuditFilter('all');
  };

  return (
    <div className="space-y-5">
      <BlueprintCatalogHeader
        matchCount={dedupedRows.length}
        totalCount={allDedupedRows.length}
        stats={catalogStats}
      />

      <PageToolbar
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: 'Search name, publisher, tag, or #id',
        }}
        filters={
          <FilterSegment
            label="Availability"
            options={availabilityOptions}
            value={availabilityFilter}
            onChange={setAvailabilityFilter}
          />
        }
        count={{
          matches: dedupedRows.length,
          total: allDedupedRows.length,
          noun: 'matches',
        }}
        trailing={
          <div className="flex flex-wrap items-center gap-2">
            {toolbarAction}
            {!showSelection && <ViewToggle value={view} onChange={setView} />}
            <CategoryFilterMenu
              categories={categories}
              selected={selectedCategories}
              onToggle={toggleCategory}
              onClear={() => setCategoryParam('')}
            />
            <FilterTray
              activeCount={trayFilterCount}
              onClear={resetAllFilters}
              trayTitle="Source and trust"
            >
              <FilterSegment
                label="Source"
                options={sourceOptions}
                value={manifestFilter}
                onChange={setManifestFilter}
                stacked
              />

              <FilterSegment
                label="Trust"
                options={trustOptions}
                value={auditFilter}
                onChange={setAuditFilter}
                stacked
              />
            </FilterTray>
          </div>
        }
      />

      {error && (
        <div className="rounded-lg border border-[color:var(--md3-warning,#f59e0b)]/35 bg-[color:var(--md3-warning,#f59e0b)]/10 px-4 py-3 text-sm text-[color:var(--surface-warning-text,var(--md3-warning,#f59e0b))]">
          Showing cached blueprint data. Latest refresh failed: {error.message}
        </div>
      )}

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
        <>
          <div className="space-y-3 md:hidden">
            {visibleRows.map((row) => (
              <MobileBlueprintRow
                key={row.blueprint.id.toString()}
                row={row}
                isAudited={
                  auditedStatus.get(row.blueprint.id.toString()) ?? false
                }
                onRegister={onRegisterBlueprint}
              />
            ))}
          </div>
          <ResultList
            className="hidden md:block"
            items={visibleRows}
            columns={listColumns}
            rowKey={(row) => row.blueprint.id.toString()}
            onRowClick={(row) =>
              navigate(`${PagePath.BLUEPRINTS}/${row.blueprint.id.toString()}`)
            }
          />
        </>
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

const BlueprintIdentitySummary = ({ row }: { row: DedupedBlueprintRow }) => {
  const { blueprint } = row;
  const category = getBlueprintCategory(blueprint);
  const modeCount = getModeCount(row);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <BlueprintVisual
        blueprint={blueprint}
        category={category}
        compact
        className="h-14 w-14 shrink-0 rounded-md"
      />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-display text-[15px] font-bold leading-tight text-foreground">
            {formatBlueprintName(blueprint.name)}
          </span>
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            #{blueprint.id.toString()}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-sm leading-snug text-muted-foreground">
          {getBlueprintDescription(blueprint)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <BlueprintMetaChip>{category}</BlueprintMetaChip>
          {modeCount > 1 && (
            <BlueprintMetaChip>
              {modeCount} {pluralize('mode', modeCount)}
            </BlueprintMetaChip>
          )}
        </div>
      </div>
    </div>
  );
};

const BlueprintMetaChip = ({ children }: { children: ReactNode }) => (
  <span className="rounded border border-border bg-muted/20 px-1.5 py-0.5 font-sans text-[11px] font-medium leading-none text-muted-foreground not-italic">
    {children}
  </span>
);

const BlueprintCapacityCell = ({
  operatorCount,
}: {
  operatorCount: number;
}) => {
  const hasOperators = operatorCount > 0;

  return (
    <div className="flex min-w-0 flex-col items-start gap-1.5">
      <BlueprintCapacitySignal operatorCount={operatorCount} />
      <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
        {hasOperators
          ? `${operatorCount.toLocaleString()} registered`
          : '0 registered'}
      </span>
    </div>
  );
};

const BlueprintCapacitySignal = ({
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
      dot={false}
      className="text-[12px]"
    >
      {hasOperators ? 'Ready' : 'Needs capacity'}
    </StatusPill>
  );
};

const catalogActionClass =
  'inline-flex min-h-8 flex-1 items-center justify-center rounded-md border border-border bg-muted/30 px-3 py-1.5 text-center font-sans text-xs font-semibold text-foreground not-italic transition-colors before:hidden after:hidden marker:hidden hover:bg-[color:var(--bg-hover)] whitespace-nowrap';

const catalogPrimaryActionClass =
  'inline-flex min-h-8 flex-1 items-center justify-center rounded-md bg-primary px-3 py-1.5 text-center font-sans text-xs font-semibold text-primary-foreground not-italic transition-colors before:hidden after:hidden marker:hidden hover:bg-primary/90 whitespace-nowrap';

const MobileBlueprintRow = ({
  row,
  isAudited,
  onRegister,
}: {
  row: DedupedBlueprintRow;
  isAudited: boolean;
  onRegister?: (blueprint: Blueprint) => void;
}) => {
  const { blueprint } = row;
  const blueprintHref = `${PagePath.BLUEPRINTS}/${blueprint.id.toString()}`;
  const operatorCount = blueprint.operatorsCount ?? 0;
  const hasOperators = operatorCount > 0;
  const description = getBlueprintDescription(blueprint);

  return (
    <article className="rounded-lg border border-border bg-[color:var(--bg-card)] p-3 shadow-[var(--shadow-card)]">
      <Link
        to={blueprintHref}
        className={twMerge('flex min-w-0 gap-3', focus.ring)}
      >
        <BlueprintVisual
          blueprint={blueprint}
          category={getBlueprintCategory(blueprint)}
          compact
          className="h-14 w-14 shrink-0 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-display text-base font-bold leading-tight tracking-normal text-foreground">
              {formatBlueprintName(blueprint.name)}
            </h3>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              #{blueprint.id.toString()}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <BlueprintCapacitySignal operatorCount={operatorCount} />
        <StatusPill
          tone={statusToneFor('audit', isAudited ? 'Audited' : 'Unaudited')}
          dot={false}
          className="text-[12px]"
        >
          {isAudited ? 'Audited' : 'Unaudited'}
        </StatusPill>
        <StatusPill
          tone={hasVerifiedManifest(blueprint) ? 'success' : 'neutral'}
          dot={false}
          className="text-[12px]"
        >
          {hasVerifiedManifest(blueprint) ? 'Pinned' : 'Chain-only'}
        </StatusPill>
      </div>

      <div className="mt-3 flex gap-2">
        {hasOperators && (
          <Link
            to={`${blueprintHref}/deploy`}
            className={catalogPrimaryActionClass}
          >
            Deploy
          </Link>
        )}
        <RegisterCapacityButton
          blueprint={blueprint}
          onRegister={onRegister}
          isPrimary={!hasOperators}
        />
      </div>
    </article>
  );
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
  const { blueprint } = row;
  const description = getBlueprintDescription(blueprint);
  const blueprintHref = `${PagePath.BLUEPRINTS}/${blueprint.id.toString()}`;
  const operatorCount = blueprint.operatorsCount ?? 0;
  const hasOperators = operatorCount > 0;
  const isFeatured = blueprint.isBoosted === true || isAudited;
  const displayName = formatBlueprintName(blueprint.name);
  const modeCount = getModeCount(row);
  const sourcePinned = hasVerifiedManifest(blueprint);
  return (
    <div
      className={twMerge(
        'group relative flex min-h-[260px] flex-col gap-3 rounded-lg border border-border bg-[color:var(--bg-card)] p-4 shadow-[var(--shadow-card)] transition-all',
        'hover:-translate-y-px hover:border-[color:var(--border-accent-hover)]',
        isFeatured && 'border-l-2 border-l-[color:var(--border-accent-hover)]',
        isSelected &&
          'border-[color:var(--border-accent-hover)] shadow-[0_0_0_1px_var(--border-accent-hover)]',
      )}
    >
      <Link
        to={blueprintHref}
        className="absolute inset-0 z-10"
        aria-label={`Open ${blueprint.name}`}
      />

      <BlueprintVisual
        blueprint={blueprint}
        category={getBlueprintCategory(blueprint)}
        compact
        className="h-28 rounded-md"
      />

      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-4 select-none font-mono text-xs tabular-nums text-foreground/15"
      >
        #{blueprint.id.toString().padStart(3, '0')}
      </span>

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

      <div className={twMerge('min-w-0', isSelectable && 'pl-8')}>
        <h3 className="line-clamp-1 pr-12 font-display font-bold text-base leading-tight tracking-normal text-foreground">
          {displayName}
        </h3>
        <p className="mt-1 line-clamp-2 pr-12 text-sm leading-snug text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        <BlueprintCapacitySignal operatorCount={operatorCount} />
        {isAudited && (
          <StatusPill
            tone={statusToneFor('audit', 'Audited')}
            dot={false}
            className="text-[12px]"
          >
            Audited
          </StatusPill>
        )}
        <StatusPill
          tone={sourcePinned ? 'success' : 'neutral'}
          dot={false}
          className="text-[12px]"
        >
          {sourcePinned ? 'Pinned' : 'Chain-only'}
        </StatusPill>
        {modeCount > 1 && (
          <BlueprintMetaChip>
            {modeCount} {pluralize('mode', modeCount)}
          </BlueprintMetaChip>
        )}
        {(blueprint.instancesCount ?? 0) > 0 && (
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {blueprint.instancesCount} instances
          </span>
        )}
      </div>

      <div className={twMerge('actions relative z-20 mt-2 flex gap-2')}>
        {hasOperators ? (
          <>
            <Link
              to={`${blueprintHref}/deploy`}
              onClick={(e) => e.stopPropagation()}
              className={catalogPrimaryActionClass}
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
      isPrimary ? catalogPrimaryActionClass : catalogActionClass,
    )}
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onRegister?.(blueprint);
    }}
  >
    Add capacity
  </button>
);

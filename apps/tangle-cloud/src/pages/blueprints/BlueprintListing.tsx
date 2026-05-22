import type { RowSelectionState } from '@tanstack/table-core';
import {
  Button,
  Card,
  CardContent,
  Input,
  Skeleton,
} from '../../components/sandbox/SandboxUi';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '@tangle-network/sandbox-ui/primitives';
import { Search } from '@tangle-network/icons';
import type { UseAllBlueprintsReturn } from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import {
  Dispatch,
  FC,
  SetStateAction,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { PagePath } from '../../types';
import { BlueprintVisual } from '../../components/blueprints/BlueprintVisual';
import { formatBlueprintName } from '../../components/blueprints/blueprintVisualUtils';
import {
  categoryBadgeStyle,
  categoryStripeStyle,
} from '../../components/blueprints/categoryColor';

const PAGE_SIZE = 12;
const ALL_CATEGORIES = 'All categories';

type AudienceFilter = 'all' | 'customers' | 'operators';
type ManifestFilter = 'all' | 'verified' | 'fallback';

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
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('all');
  const [manifestFilter, setManifestFilter] = useState<ManifestFilter>('all');
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

      return true;
    });
  }, [
    audienceFilter,
    blueprintItems,
    deferredSearchQuery,
    manifestFilter,
    selectedCategory,
  ]);

  useEffect(() => {
    setPage(0);
  }, [audienceFilter, deferredSearchQuery, manifestFilter, selectedCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBlueprints.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages - 1);
  const visibleBlueprints = filteredBlueprints.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== ALL_CATEGORIES ||
    audienceFilter !== 'all' ||
    manifestFilter !== 'all';

  const showSelection =
    typeof rowSelection !== 'undefined' &&
    typeof onRowSelectionChange === 'function';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-80 rounded-lg" />
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
      <Card variant="sandbox">
        <CardContent className="flex min-h-52 flex-col items-center justify-center p-8 text-center">
          <h2 className="font-display font-bold text-foreground text-xl">
            No blueprints on this network
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground text-sm">
            Register an operator, switch networks, or publish a blueprint to
            make it available for deployment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card variant="elevated" className="catalog-controls">
        <CardContent className="space-y-4 p-4 md:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(360px,1fr)_auto_auto] xl:items-center">
            <Input
              value={searchQuery}
              onChange={setSearchQuery}
              leftIcon={<Search className="h-4 w-4 fill-current" />}
              placeholder="Search blueprints, services, publishers, or IDs"
              className="w-full"
              inputClassName="h-11 bg-background text-sm"
            />

            <label className="grid gap-1">
              <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                Availability
              </span>
              <select
                value={audienceFilter}
                onChange={(event) =>
                  setAudienceFilter(event.currentTarget.value as AudienceFilter)
                }
                className="h-10 min-w-40 rounded-md border border-border bg-background px-3 font-semibold text-foreground text-sm outline-none transition-colors hover:bg-muted focus:border-primary"
              >
                <option value="all">All availability</option>
                <option value="customers">Has operators</option>
                <option value="operators">Needs capacity</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                Source
              </span>
              <select
                value={manifestFilter}
                onChange={(event) =>
                  setManifestFilter(event.currentTarget.value as ManifestFilter)
                }
                className="h-10 min-w-36 rounded-md border border-border bg-background px-3 font-semibold text-foreground text-sm outline-none transition-colors hover:bg-muted focus:border-primary"
              >
                <option value="all">All sources</option>
                <option value="verified">Pinned source</option>
                <option value="fallback">Chain-only</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 border-border border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              <span className="hidden shrink-0 items-center pr-1 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider sm:inline-flex">
                Category
              </span>
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

            <div className="flex shrink-0 items-center gap-3 text-muted-foreground text-xs">
              <span className="text-muted-foreground text-xs">
                {filteredBlueprints.length} matches
              </span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(ALL_CATEGORIES);
                    setAudienceFilter('all');
                    setManifestFilter('all');
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredBlueprints.length === 0 ? (
        <Card variant="sandbox">
          <CardContent className="flex min-h-52 flex-col items-center justify-center p-8 text-center">
            <h3 className="font-display font-bold text-foreground text-lg">
              No blueprints match these filters
            </h3>
            <p className="mt-2 max-w-md text-muted-foreground text-sm">
              Try a broader category, remove the source filter, or search by the
              blueprint name, publisher, or protocol ID.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="results-grid grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleBlueprints.map((blueprint) => (
            <BlueprintCard
              key={blueprint.id.toString()}
              blueprint={blueprint}
              isSelectable={showSelection}
              isSelected={rowSelection?.[blueprint.id.toString()] === true}
              onSelectionChange={(isSelected) => {
                onRowSelectionChange?.((previous) => ({
                  ...previous,
                  [blueprint.id.toString()]: isSelected,
                }));
              }}
              onRegister={onRegisterBlueprint}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 border-border border-t pt-4 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing{' '}
          {filteredBlueprints.length === 0 ? 0 : safePage * PAGE_SIZE + 1}-
          {Math.min((safePage + 1) * PAGE_SIZE, filteredBlueprints.length)} of{' '}
          {filteredBlueprints.length}{' '}
          {pluralize('blueprint', filteredBlueprints.length)}
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

const BlueprintCard = ({
  blueprint,
  isSelectable,
  isSelected,
  onSelectionChange,
  onRegister,
}: {
  blueprint: Blueprint;
  isSelectable: boolean;
  isSelected: boolean;
  onSelectionChange: (isSelected: boolean) => void;
  onRegister?: (blueprint: Blueprint) => void;
}) => {
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
  return (
    <Card
      variant="sandbox"
      hover
      className={twMerge(
        'blueprint-card group relative min-h-[410px] overflow-hidden',
        isSelected && 'border-primary shadow-[var(--shadow-accent)]',
      )}
      style={categoryStripeStyle(category)}
    >
      <Link
        to={blueprintHref}
        className="absolute inset-0 z-10"
        aria-label={`Open ${blueprint.name}`}
      />

      <CardContent className="relative flex h-full min-h-[410px] flex-col p-5">
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
        </div>

        {isSelectable && (
          <label
            className="absolute right-7 top-7 z-20 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-black/35 transition-colors hover:bg-black/50"
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

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
            {capacityLabel}
          </span>
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
          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
            {manifestStatus}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted/20 p-3">
          <div className="min-w-0">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
              Publisher
            </p>
            <p className="mt-1 truncate font-mono text-foreground text-xs">
              {shortenIdentity(blueprint.author)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
              Source
            </p>
            <p className="mt-1 truncate text-foreground text-xs">
              {manifestStatus}
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
              Next step
            </p>
            <p className="mt-1 truncate text-foreground text-xs">
              {hasOperators ? 'Review checkout' : 'Register capacity'}
            </p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 flex-1 text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 border-border border-t pt-4">
          <BlueprintMetric label="Operators" value={blueprint.operatorsCount} />
          <BlueprintMetric label="Instances" value={blueprint.instancesCount} />
          <BlueprintMetric label="ID" value={blueprint.id.toString()} />
        </div>

        <div className="mt-5 flex flex-col gap-3 border-border border-t pt-4">
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <div className="min-w-0">
              <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                Wallet approval
              </p>
              <p className="mt-1 truncate text-foreground text-xs">
                After review
              </p>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                Source
              </p>
              <p className="mt-1 truncate text-foreground text-xs">
                {manifestStatus}
              </p>
            </div>
          </div>

          <div className="actions relative z-20 grid grid-cols-2 gap-2">
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

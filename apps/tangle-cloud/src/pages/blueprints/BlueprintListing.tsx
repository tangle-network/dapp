import type { RowSelectionState } from '@tanstack/table-core';
import {
  Button,
  Card,
  CardContent,
  Input,
  Skeleton,
} from '../../components/sandbox/SandboxUi';
import { Search } from '@tangle-network/icons';
import type { UseAllBlueprintsReturn } from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import {
  Dispatch,
  FC,
  ReactNode,
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
      <Card variant="sandbox" className="border-border bg-card">
        <CardContent className="space-y-4 p-4 md:p-5">
          <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto] xl:items-center">
            <Input
              value={searchQuery}
              onChange={setSearchQuery}
              leftIcon={<Search className="h-4 w-4 fill-current" />}
              placeholder="Search blueprints, services, publishers, or IDs"
              className="w-full"
              inputClassName="h-12 bg-background text-base"
            />

            <div className="flex flex-wrap gap-2">
              <FilterPill
                isActive={audienceFilter === 'all'}
                onClick={() => setAudienceFilter('all')}
              >
                All
              </FilterPill>
              <FilterPill
                isActive={audienceFilter === 'customers'}
                onClick={() => setAudienceFilter('customers')}
              >
                Has operators
              </FilterPill>
              <FilterPill
                isActive={audienceFilter === 'operators'}
                onClick={() => setAudienceFilter('operators')}
              >
                Needs capacity
              </FilterPill>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <FilterPill
                isActive={manifestFilter === 'all'}
                onClick={() => setManifestFilter('all')}
              >
                All sources
              </FilterPill>
              <FilterPill
                isActive={manifestFilter === 'verified'}
                onClick={() => setManifestFilter('verified')}
              >
                Pinned
              </FilterPill>
              <FilterPill
                isActive={manifestFilter === 'fallback'}
                onClick={() => setManifestFilter('fallback')}
              >
                Chain-only
              </FilterPill>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <CategoryPill
              isActive={selectedCategory === ALL_CATEGORIES}
              onClick={() => setSelectedCategory(ALL_CATEGORIES)}
            >
              {ALL_CATEGORIES}
              <span className="ml-2 text-muted-foreground">
                {blueprintItems.length}
              </span>
            </CategoryPill>
            {categories.map(({ category, count }) => (
              <CategoryPill
                key={category}
                isActive={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
                <span className="ml-2 text-muted-foreground">{count}</span>
              </CategoryPill>
            ))}
          </div>

          <div className="flex flex-col gap-2 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>
              {filteredBlueprints.length} of {blueprintItems.length}{' '}
              {pluralize('blueprint', blueprintItems.length)} match
            </span>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="self-start sm:self-auto"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(ALL_CATEGORIES);
                  setAudienceFilter('all');
                  setManifestFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {filteredBlueprints.length === 0 ? (
        <Card variant="sandbox">
          <CardContent className="flex min-h-52 flex-col items-center justify-center p-8 text-center">
            <h2 className="font-display font-bold text-foreground text-xl">
              No blueprints match these filters
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground text-sm">
              Try a broader category, remove the source filter, or search by the
              blueprint name, publisher, or protocol ID.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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

      <div className="flex flex-col gap-3 border-border border-t pt-5 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
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
  const capacityLabel =
    operatorCount === 0
      ? 'No operators'
      : `${operatorCount} ${pluralize('operator', operatorCount)}`;
  const displayName = formatBlueprintName(blueprint.name);
  return (
    <Card
      variant="sandbox"
      hover
      className={twMerge(
        'group relative min-h-[410px] overflow-hidden border-border bg-card shadow-[var(--shadow-card)]',
        isSelected && 'border-primary shadow-[var(--shadow-accent)]',
      )}
    >
      <Link
        to={blueprintHref}
        className="absolute inset-0 z-10"
        aria-label={`Open ${blueprint.name}`}
      />

      <CardContent className="relative flex h-full min-h-[410px] flex-col p-4">
        <BlueprintVisual blueprint={blueprint} category={category} />

        <div className="mt-4">
          <p className="font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
            {category}
          </p>
          <h2 className="mt-1 line-clamp-1 font-display font-extrabold text-foreground text-2xl tracking-tight">
            {displayName}
          </h2>
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
          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
            {manifestStatus}
          </span>
        </div>

        <p className="mt-4 line-clamp-4 flex-1 text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 border-border border-t pt-4">
          <BlueprintMetric label="Operators" value={blueprint.operatorsCount} />
          <BlueprintMetric label="Instances" value={blueprint.instancesCount} />
          <BlueprintMetric label="ID" value={blueprint.id.toString()} />
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
              Publisher
            </p>
            <p className="truncate font-mono text-muted-foreground text-xs">
              {shortenIdentity(blueprint.author)}
            </p>
          </div>

          <div className="relative z-20 flex shrink-0 items-center gap-2">
            {blueprint.githubUrl && (
              <a
                href={blueprint.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="relative z-20 rounded-md border border-border px-3 py-2 font-semibold text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
                onClick={(event) => event.stopPropagation()}
              >
                GitHub
              </a>
            )}
            <button
              type="button"
              className="rounded-md border border-border px-3 py-2 font-semibold text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRegister?.(blueprint);
              }}
            >
              Register
            </button>
            <Link
              to={`${blueprintHref}/deploy`}
              className="rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground text-xs transition-colors hover:bg-primary/90"
            >
              Instance
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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

const FilterPill = ({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={twMerge(
      'h-10 rounded-md border px-3 font-semibold text-sm transition-colors',
      isActive
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground',
    )}
  >
    {children}
  </button>
);

const CategoryPill = ({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={twMerge(
      'shrink-0 rounded-full border px-3 py-2 font-semibold text-xs transition-colors',
      isActive
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
    )}
  >
    {children}
  </button>
);

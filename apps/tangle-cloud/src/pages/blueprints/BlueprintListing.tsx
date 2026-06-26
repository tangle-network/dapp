import type { RowSelectionState } from '@tanstack/table-core';
import BlueprintGallery from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery';
import type { BlueprintItemProps } from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery/types';
import type { UseAllBlueprintsReturn } from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Button } from '@tangle-network/ui-components';
import {
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router';
import {
  dedupeBlueprintsByIdentity,
  type DedupedBlueprintRow,
} from '../../blueprintApps/dedupe';
import { BlueprintVisual } from '../../components/blueprints/BlueprintVisual';
import { PageHeader } from '../../components/chrome';
import { formatBlueprintName } from '../../components/blueprints/blueprintVisualUtils';
import { PagePath } from '../../types';

type Props = {
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: Dispatch<SetStateAction<RowSelectionState>>;
  onRegisterBlueprint?: (blueprint: Blueprint) => void;
  toolbarAction?: ReactNode;
  onRetry?: () => void;
} & Omit<UseAllBlueprintsReturn, 'refetch'>;

const pluralize = (label: string, count: number) =>
  count === 1 ? label : `${label}s`;

const normalizeTag = (raw: string): string => {
  const t = raw.trim();
  if (t.length === 0) return '';
  if (/^[A-Z]{2,5}$/.test(t)) return t;

  return t
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getBlueprintCategory = (blueprint: Blueprint): string => {
  const declaredTag = blueprint.blueprintUi?.tags
    ?.map(normalizeTag)
    .find(Boolean);

  if (declaredTag) {
    return declaredTag;
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

const getModeCount = (row: DedupedBlueprintRow) =>
  row.modes?.length ?? (row.aliases.length > 0 ? row.aliases.length + 1 : 1);

const toGalleryItem = (
  row: DedupedBlueprintRow,
  onView: (blueprint: Blueprint) => void,
  _onDeploy: (blueprint: Blueprint) => void,
  _onRegister?: (blueprint: Blueprint) => void,
): BlueprintItemProps => {
  const { blueprint } = row;
  const category = getBlueprintCategory(blueprint);
  const modeCount = getModeCount(row);

  return {
    id: blueprint.id,
    name: formatBlueprintName(blueprint.name),
    author:
      modeCount > 1
        ? `${blueprint.author} · ${modeCount} ${pluralize('mode', modeCount)}`
        : blueprint.author,
    imgUrl: blueprint.imgUrl,
    description: blueprint.description,
    instancesCount: blueprint.instancesCount,
    operatorsCount: blueprint.operatorsCount,
    stakersCount: blueprint.stakersCount,
    tvl: blueprint.tvl,
    isBoosted: blueprint.isBoosted,
    category,
    onClick: () => onView(blueprint),
    renderImage: () => (
      <BlueprintVisual
        blueprint={blueprint}
        category={category}
        compact
        className="h-14 w-14 shrink-0 rounded-xl border border-mono-60 dark:border-mono-170"
      />
    ),
    action: undefined,
  };
};

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

  const rows = useMemo(() => {
    const sorted = Array.from(blueprints.values())
      .filter((bp) => bp.name !== 'Onchain Blueprint')
      .sort((a, b) => {
        if (a.isBoosted && !b.isBoosted) return -1;
        if (!a.isBoosted && b.isBoosted) return 1;
        if (a.id === b.id) return 0;
        return a.id < b.id ? 1 : -1;
      });

    return dedupeBlueprintsByIdentity(sorted);
  }, [blueprints]);

  const galleryItems = useMemo(
    () =>
      rows.map((row) =>
        toGalleryItem(
          row,
          (blueprint) => navigate(`${PagePath.BLUEPRINTS}/${blueprint.id}`),
          (blueprint) =>
            navigate(`${PagePath.BLUEPRINTS}/${blueprint.id}/deploy`),
          onRegisterBlueprint,
        ),
      ),
    [navigate, onRegisterBlueprint, rows],
  );

  const hasCachedData = rows.length > 0;

  return (
    <div className="space-y-5">
      <PageHeader density="compact" title="Blueprints" action={toolbarAction} />

      {error && hasCachedData && (
        <div className="rounded-xl border border-yellow-50/40 bg-yellow-10/20 px-4 py-3 text-sm font-medium text-yellow-90 dark:border-yellow-70/40 dark:bg-yellow-120/30 dark:text-yellow-30">
          Showing cached blueprints. Latest refresh failed: {error.message}
          {onRetry !== undefined && (
            <Button
              variant="link"
              size="sm"
              className="ml-3 inline-flex p-0"
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
        </div>
      )}

      {hasCachedData && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-mono-100 dark:text-mono-80">
            {rows.length} blueprints
          </span>
        </div>
      )}

      <BlueprintGallery
        blueprints={galleryItems}
        isLoading={isLoading && !hasCachedData}
        error={hasCachedData ? null : error}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
      />
    </div>
  );
};

BlueprintListing.displayName = 'BlueprintListing';

export default BlueprintListing;

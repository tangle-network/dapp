import type { RowSelectionState } from '@tanstack/table-core';
import BlueprintGallery from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery';
import type { BlueprintItemProps } from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery/types';
import type { UseAllBlueprintsReturn } from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Button, Typography } from '@tangle-network/ui-components';
import {
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router';
import { twMerge } from 'tailwind-merge';
import {
  dedupeBlueprintsByIdentity,
  type DedupedBlueprintRow,
} from '../../blueprintApps/dedupe';
import { BlueprintVisual } from '../../components/blueprints/BlueprintVisual';
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
  onDeploy: (blueprint: Blueprint) => void,
  onRegister?: (blueprint: Blueprint) => void,
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
        className="h-[72px] w-[72px] shrink-0 rounded-full"
      />
    ),
    action: (
      <BlueprintActions
        blueprint={blueprint}
        onView={onView}
        onDeploy={onDeploy}
        onRegister={onRegister}
      />
    ),
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
    const sorted = Array.from(blueprints.values()).sort((a, b) => {
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Typography variant="h1" className="text-mono-200 dark:text-mono-0">
            Blueprints
          </Typography>

          <Typography
            variant="body1"
            className="mt-2 max-w-2xl text-mono-120 dark:text-mono-80"
          >
            {rows.length.toLocaleString()} deployable service{' '}
            {pluralize('blueprint', rows.length)}
          </Typography>
        </div>

        {toolbarAction !== undefined && (
          <div className="flex shrink-0 justify-start md:justify-end">
            {toolbarAction}
          </div>
        )}
      </div>

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

const BlueprintActions: FC<{
  blueprint: Blueprint;
  onView: (blueprint: Blueprint) => void;
  onDeploy: (blueprint: Blueprint) => void;
  onRegister?: (blueprint: Blueprint) => void;
}> = ({ blueprint, onView, onDeploy, onRegister }) => {
  const hasOperators = (blueprint.operatorsCount ?? 0) > 0;

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="min-w-0 flex-1 px-3"
        onClick={() => onView(blueprint)}
      >
        View
      </Button>

      {hasOperators && (
        <Button
          variant="primary"
          size="sm"
          className="min-w-0 flex-1 px-3"
          onClick={() => onDeploy(blueprint)}
        >
          Deploy
        </Button>
      )}

      {onRegister !== undefined && (
        <Button
          variant={hasOperators ? 'utility' : 'primary'}
          size="sm"
          className={twMerge(
            'min-w-0 flex-1 px-3',
            hasOperators && 'uppercase',
          )}
          onClick={() => onRegister(blueprint)}
        >
          Add capacity
        </Button>
      )}
    </>
  );
};

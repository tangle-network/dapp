import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Typography } from '@tangle-network/ui-components';
import { Dispatch, FC, SetStateAction, useCallback, useMemo } from 'react';
import BlueprintLogo from '../../components/restaking/BlueprintLogo';
import { OperatorBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { twMerge } from 'tailwind-merge';

type Props = {
  blueprints: OperatorBlueprint[];
  setSelection: Dispatch<SetStateAction<Blueprint['id'][]>>;
  selection: Blueprint['id'][];
};

type ItemProps = {
  onClick: (id: Blueprint['id']) => void;
  blueprint: OperatorBlueprint;
};

const LISTBOX_COMMON_CLASSNAME =
  'rounded-md bg-mono-20 dark:bg-mono-170 h-[230px] min-w-[300px] overflow-y-auto';

const BlueprintItem: FC<ItemProps> = ({ blueprint, onClick }) => {
  return (
    <div
      className="flex items-center justify-start gap-2 cursor-pointer hover:bg-mono-40 dark:hover:bg-mono-160 p-2 first:rounded-t-md last:rounded-b-md select-none"
      onClick={() => onClick(blueprint.blueprintId)}
    >
      <div>
        <BlueprintLogo
          name={blueprint.blueprint.metadata.name}
          url={blueprint.blueprint.metadata.logo ?? undefined}
          size="lg"
        />
      </div>

      <div className="flex flex-col">
        <Typography variant="body2" className="font-bold dark:text-mono-0">
          {blueprint.blueprint.metadata.name}
        </Typography>

        <Typography variant="body2">
          {blueprint.blueprint.metadata.author} &bull;{' '}
          {blueprint.blueprint.metadata.category}
        </Typography>
      </div>
    </div>
  );
};

const BlueprintSelectionListbox: FC<Props> = ({
  blueprints,
  setSelection,
  selection,
}) => {
  const handleSelection = useCallback(
    (id: Blueprint['id']) => {
      setSelection((prev) => [...prev, id]);
    },
    [setSelection],
  );

  const available = useMemo(() => {
    return blueprints.filter(
      (blueprint) => !selection.includes(blueprint.blueprintId),
    );
  }, [blueprints, selection]);

  const selected = useMemo(() => {
    return blueprints.filter((blueprint) =>
      selection.includes(blueprint.blueprintId),
    );
  }, [blueprints, selection]);

  const handleDeselection = useCallback(
    (id: Blueprint['id']) => {
      setSelection((prev) => prev.filter((prevId) => id !== prevId));
    },
    [setSelection],
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Available blueprints */}
      <div className="space-y-1 basis-1/2">
        <Typography variant="body2" className="dark:text-mono-120 select-none">
          Available ({available.length})
        </Typography>

        <div
          className={twMerge(
            LISTBOX_COMMON_CLASSNAME,
            available.length === 0 && 'flex items-center justify-center p-8',
          )}
        >
          {available.length > 0 ? (
            <div className="flex flex-col gap-1">
              {available.map((blueprint) => (
                <BlueprintItem
                  key={blueprint.blueprintId}
                  blueprint={blueprint}
                  onClick={handleSelection}
                />
              ))}
            </div>
          ) : (
            <Typography variant="body2" className="text-center select-none">
              All available blueprints have been selected for delegation.
            </Typography>
          )}
        </div>
      </div>

      {/* Selection */}
      <div className="space-y-1 basis-1/2">
        <Typography variant="body2" className="dark:text-mono-120 select-none">
          Selected ({selection.length})
        </Typography>

        <div
          className={twMerge(
            LISTBOX_COMMON_CLASSNAME,
            selected.length === 0 && 'flex items-center justify-center p-8',
          )}
        >
          {selected.length > 0 ? (
            <div className="flex flex-col gap-1">
              {selected.map((blueprint) => (
                <BlueprintItem
                  key={blueprint.blueprintId}
                  blueprint={blueprint}
                  onClick={handleDeselection}
                />
              ))}
            </div>
          ) : (
            <Typography variant="body2" className="text-center select-none">
              No blueprints have been selected for delegation.
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlueprintSelectionListbox;

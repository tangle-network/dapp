import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Typography } from '@tangle-network/ui-components';
import { Dispatch, FC, SetStateAction, useCallback, useMemo } from 'react';
import BlueprintLogo from '../../components/restaking/BlueprintLogo';
import { OperatorBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';

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
  'rounded-md bg-mono-100 dark:bg-mono-170 min-h-[200px] min-w-[300px] overflow-y-auto';

const BlueprintItem: FC<ItemProps> = ({ blueprint, onClick }) => {
  // TODO: TVL calculation.
  return (
    <div
      className="flex gap-1 cursor-pointer hover:bg-mono-160 dark:hover:bg-mono-160 p-2 first:rounded-t-md last:rounded-b-md"
      onClick={() => onClick(blueprint.blueprintId)}
    >
      <div>
        <BlueprintLogo name={blueprint.blueprint.metadata.name} size="lg" />
      </div>

      <div className="flex flex-col">
        <Typography variant="h5">
          {blueprint.blueprint.metadata.name}
        </Typography>

        <Typography variant="body2">
          {blueprint.blueprint.metadata.author} &bull;{' '}
          {blueprint.blueprint.metadata.category} &bull; TVL: $&mdash;
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
    <div className="flex gap-4">
      {/* Available blueprints */}
      <div className="space-y-1 basis-1/2">
        <Typography variant="body2" className="dark:text-mono-120">
          Not Selected ({available.length})
        </Typography>

        <div className={LISTBOX_COMMON_CLASSNAME}>
          <div className="flex flex-col gap-1">
            {available.map((blueprint) => (
              <BlueprintItem
                key={blueprint.blueprintId}
                blueprint={blueprint}
                onClick={handleSelection}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selection */}
      <div className="space-y-1 basis-1/2">
        <Typography variant="body2" className="dark:text-mono-120">
          Selected ({selection.length})
        </Typography>

        <div className={LISTBOX_COMMON_CLASSNAME}>
          {selected.map((blueprint) => (
            <BlueprintItem
              key={blueprint.blueprintId}
              blueprint={blueprint}
              onClick={handleDeselection}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlueprintSelectionListbox;

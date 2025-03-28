import { ChevronDown, ShieldKeyholeFillIcon } from '@tangle-network/icons';
import { InfoIconWithTooltip, Typography } from '@tangle-network/ui-components';
import { FC, useCallback, useState } from 'react';
import BlueprintLogo from './BlueprintLogo';
import SelectBlueprintsModal from '../../containers/restaking/SelectBlueprintsModal';
import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { twMerge } from 'tailwind-merge';

type BlueprintId = Blueprint['id'];

type Props = {
  operatorAddress?: SubstrateAddress;
  setSelection: (selected: BlueprintId[]) => void;
};

const BlueprintSelection: FC<Props> = ({ operatorAddress, setSelection }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [localSelection, setLocalSelection] = useState<Blueprint[] | null>(
    null,
  );

  const handleSelection = useCallback(
    (selected: BlueprintId[]) => {
      setSelection(selected);

      setLocalSelection((previous) => {
        if (previous === null) {
          return null;
        }

        return previous.filter((blueprint) => selected.includes(blueprint.id));
      });
    },
    [setSelection],
  );

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={twMerge(
          'flex justify-between items-center rounded-xl py-2.5 px-4 bg-mono-20 dark:bg-mono-180',
          operatorAddress !== undefined &&
            'cursor-pointer hover:bg-mono-30 dark:hover:bg-mono-170',
        )}
      >
        <div className="flex items-center gap-1">
          <ShieldKeyholeFillIcon className="dark:fill-purple-50" />

          <Typography variant="body1">Selected Blueprint(s)</Typography>

          <InfoIconWithTooltip content="Pending" />
        </div>

        {localSelection === null ? (
          <Typography variant="body1" className="flex items-center gap-1">
            None <ChevronDown />{' '}
          </Typography>
        ) : (
          <div>
            {localSelection.map((blueprint) => (
              <BlueprintLogo
                key={blueprint.id}
                name={blueprint.name}
                url={blueprint.imgUrl ?? undefined}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      <SelectBlueprintsModal
        setSelection={handleSelection}
        operatorAddress={operatorAddress}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
      />
    </>
  );
};

export default BlueprintSelection;

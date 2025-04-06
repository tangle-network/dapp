import { ChevronDown, ShieldKeyholeFillIcon } from '@tangle-network/icons';
import {  Typography } from '@tangle-network/ui-components';
import { FC, useCallback, useState } from 'react';
import SelectBlueprintsModal from '../../containers/restaking/SelectBlueprintsModal';
import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { twMerge } from 'tailwind-merge';
import useBlueprintStore from '../../context/useBlueprintStore';

type Props = {
  operatorAddress?: SubstrateAddress;
};

const BlueprintSelection: FC<Props> = ({ operatorAddress }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selection, setSelection } = useBlueprintStore();

  const handleSelection = useCallback(
    (selected: Blueprint['id'][]) => {
      setSelection(selected);
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
        </div>

        <div className="flex items-center gap-1">
          {selection.length === 0 ? (
          <Typography variant="body1">
            None
          </Typography>
        ) : (
          <div>
            {selection.length} selected
          </div>
        )}

        <ChevronDown />
        </div>
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

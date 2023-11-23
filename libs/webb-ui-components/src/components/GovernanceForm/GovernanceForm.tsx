import { type FC, useCallback, useMemo, useState } from 'react';
import { getAbiItem } from 'viem';

import SelectChainRing from './SelectChainRing';
import { GovernanceFormProps } from './types';

const GovernanceForm: FC<GovernanceFormProps> = ({
  abi,
  typedChainIdSelections,
  governanceFncNames,
}) => {
  const [selectedTypedChainId, setSelectedTypedChainId] = useState<
    number | undefined
  >();

  const abiItems = useMemo(
    () =>
      governanceFncNames.map((fncName) =>
        getAbiItem({
          abi,
          name: fncName,
        })
      ),
    [abi, governanceFncNames]
  );

  const handleSelectedChain = useCallback((typedChainId: number) => {
    setSelectedTypedChainId(typedChainId);
  }, []);

  return (
    <div className="bg-mono-0 dark:bg-mono-190 space-y-4">
      {/* Chains Ring */}
      <SelectChainRing
        typedChainIds={typedChainIdSelections}
        currentSelectedTypedChainId={selectedTypedChainId}
        handleSelectedChain={handleSelectedChain}
      />

      {/* Form */}
      <div></div>
    </div>
  );
};

export default GovernanceForm;

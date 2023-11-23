import { type FC, useCallback, useMemo, useState } from 'react';
import { getAbiItem } from 'viem';
import cx from 'classnames';

import FunctionInputs from './FunctionInputs';
import SelectChainRing from './SelectChainRing';
import { GovernanceFormProps, FunctionInfoType } from './types';

const GovernanceForm: FC<GovernanceFormProps> = ({
  abi,
  typedChainIdSelections,
  governanceFncNames,
}) => {
  const [selectedTypedChainId, setSelectedTypedChainId] = useState<
    number | undefined
  >();

  const fncInfos = useMemo<FunctionInfoType[]>(
    () =>
      governanceFncNames.map((fncName) => {
        const item = getAbiItem({
          abi,
          name: fncName,
        });
        return {
          fncName: item.name,
          fncParams: item.inputs.map((input) => ({
            name: input.name,
            type: input.type,
          })),
        };
      }),
    [abi, governanceFncNames]
  );

  const handleSelectedChain = useCallback((typedChainId: number) => {
    setSelectedTypedChainId(typedChainId);
  }, []);

  return (
    <div
      className={cx(
        'max-w-[600px] bg-mono-0 dark:bg-mono-190 rounded-xl p-9',
        'flex flex-col items-center gap-6',
        'border border-mono-40 dark:border-mono-160'
      )}
    >
      {/* Chains Ring */}
      <SelectChainRing
        typedChainIds={typedChainIdSelections}
        currentSelectedTypedChainId={selectedTypedChainId}
        handleSelectedChain={handleSelectedChain}
      />

      {/* Form */}
      <div className="space-y-3 w-full">
        {fncInfos.map((fncInfo) => (
          <FunctionInputs fncInfo={fncInfo} />
        ))}
      </div>
    </div>
  );
};

export default GovernanceForm;

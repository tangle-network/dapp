import { type FC, useMemo, useState } from 'react';
import { getAbiItem } from 'viem';
import cx from 'classnames';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';

import ChainsRing from '../../components/ChainsRing';
import { Typography } from '../../typography';
import FunctionInputs from './GovernanceFncCaller';
import type {
  ContractDetailCardProps,
  GovernanceFncCallerProps,
} from './types';
import type { ChainRingItemType } from '../../components/ChainsRing/types';

const GovernanceContractDetailCard: FC<ContractDetailCardProps> = ({
  metadata,
  abi,
  governanceFncNames,
  typedChainIdSelections,
}) => {
  const [selectedTypedChainId, setSelectedTypedChainId] = useState<
    number | undefined
  >();

  const chainRingItems = useMemo<ChainRingItemType[]>(() => {
    return typedChainIdSelections.map((typedChainId) => {
      return {
        typedChainId,
        isActive: selectedTypedChainId === typedChainId,
        onClick: () => {
          setSelectedTypedChainId(typedChainId);
        },
      };
    });
  }, [typedChainIdSelections, selectedTypedChainId]);

  const isReadyToCallFnc = useMemo(
    () => selectedTypedChainId !== undefined,
    [selectedTypedChainId]
  );

  const fncCallerProps = useMemo<GovernanceFncCallerProps[]>(
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

  return (
    <div
      className={cx(
        'min-h-[700px] max-w-[600px] space-y-6 bg-mono-0 dark:bg-mono-190 rounded-xl p-9',
        'border border-mono-40 dark:border-mono-160'
      )}
    >
      {/* Chains Ring */}
      <div className="flex justify-center items-center">
        <ChainsRing
          chainItems={chainRingItems}
          circleContent={
            <div>
              <Typography
                variant="body1"
                fw="bold"
                ta="center"
                className="text-mono-140 dark:text-mono-80 capitalize"
              >
                {selectedTypedChainId !== undefined
                  ? chainsConfig[selectedTypedChainId].name
                  : 'Select Chain'}
              </Typography>
            </div>
          }
        />
      </div>

      <div className="h-max space-y-2">
        <Typography variant="h5" fw="bold">
          Metadata
        </Typography>
        <div className="p-4 rounded-lg bg-[rgba(247,248,247,0.80)] dark:bg-mono-170 space-y-2">
          {metadata.map((item) => {
            const { title, detailsCmp } = item;
            return (
              <div className="flex items-center justify-between">
                <Typography variant="body1" fw="bold">
                  {title}
                </Typography>
                {detailsCmp}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="h5" fw="bold">
          Governance Functions
        </Typography>
        <div className="space-y-3 w-full">
          {fncCallerProps.map((fncInfo) => (
            <FunctionInputs
              {...fncInfo}
              isDisabled={!isReadyToCallFnc}
              warningText={
                !isReadyToCallFnc ? 'Please select a chain' : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GovernanceContractDetailCard;

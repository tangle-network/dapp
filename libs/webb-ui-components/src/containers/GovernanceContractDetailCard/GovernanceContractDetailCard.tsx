import { type FC, useMemo } from 'react';
import { getAbiItem } from 'viem';
import cx from 'classnames';

import { Typography } from '../../typography';
import FunctionInputs from './FunctionInputs';
import type { ContractDetailCardProps, FunctionInfoType } from './types';

const GovernanceContractDetailCard: FC<ContractDetailCardProps> = ({
  metadata,
  abi,
  governanceFncNames,
}) => {
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

  return (
    <div
      className={cx(
        'min-h-[700px] max-w-[600px] space-y-6 bg-mono-0 dark:bg-mono-190 rounded-xl p-9',
        'border border-mono-40 dark:border-mono-160'
      )}
    >
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
          {fncInfos.map((fncInfo) => (
            <FunctionInputs fncInfo={fncInfo} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GovernanceContractDetailCard;

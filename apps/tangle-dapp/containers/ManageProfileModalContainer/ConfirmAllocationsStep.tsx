import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { RestakingMethod } from './ManageProfileModalContainer';
import { RestakingAllocationMap } from './types';

export type ConfirmAllocationsStepProps = {
  method: RestakingMethod;
  allocations: RestakingAllocationMap;
};

const ConfirmAllocationsStep: FC<ConfirmAllocationsStepProps> = () => {
  return (
    <div className="flex flex-row gap-2 w-full">
      <div className="border dark:bg-mono-160 rounded-lg w-full p-3"></div>
      <div className="flex flex-col gap-2 border dark:bg-mono-160 rounded-lg w-full p-3">
        <Typography variant="body2" fw="semibold">
          Things to Note
        </Typography>

        <Typography variant="body3" fw="normal">
          Active Service Lock-In:
        </Typography>

        <Typography variant="body3" fw="normal">
          <li>
            Restaked tokens in active roles are locked for the duration of the
            service. Active roles can only have increased restakes.
          </li>
        </Typography>

        <Typography variant="body3" fw="normal">
          Switching to Shared Profile:
        </Typography>

        <Typography variant="body3" fw="normal">
          <li>
            Shared profile requires even distribution of total restake across
            all roles. Total shared restake must be at least equal to current
            total for active roles.
          </li>
        </Typography>
      </div>
    </div>
  );
};

export default ConfirmAllocationsStep;

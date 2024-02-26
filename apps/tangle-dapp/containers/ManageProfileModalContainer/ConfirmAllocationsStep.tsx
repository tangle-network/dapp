import { InformationLine } from '@webb-tools/icons';
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
      <div className="dark:bg-mono-160 rounded-lg w-full p-3"></div>

      <div className="flex flex-col gap-2 dark:bg-mono-160 rounded-lg w-full p-3 text-mono-0 dark:text-mono-0">
        <div className="flex justify-between">
          <Typography
            variant="body2"
            fw="semibold"
            className="text-inherit dark:text-inherit"
          >
            Things to Note
          </Typography>

          <InformationLine />
        </div>

        <div>
          <Typography
            variant="body3"
            fw="normal"
            className="text-inherit dark:text-inherit"
          >
            Active Service Lock-In:
          </Typography>

          <ul className="list-disc pl-2">
            <li className="ml-4 list-outside">
              <Typography
                variant="body3"
                fw="normal"
                className="text-inherit dark:text-inherit"
              >
                Restaked tokens in active roles are locked for the duration of
                the service. Active roles can only have increased restakes.
              </Typography>
            </li>
          </ul>
        </div>

        <div>
          <Typography
            variant="body3"
            fw="normal"
            className="text-inherit dark:text-inherit"
          >
            Switching to Shared Profile:
          </Typography>

          <ul className="list-disc pl-2">
            <li className="ml-4 list-outside">
              <Typography
                variant="body3"
                fw="normal"
                className="text-inherit dark:text-inherit"
              >
                Shared profile requires even distribution of total restake
                across all roles. Total shared restake must be at least equal to
                current total for active roles.
              </Typography>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAllocationsStep;

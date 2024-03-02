import { BN } from '@polkadot/util';
import { InformationLine } from '@webb-tools/icons';
import { Chip, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { ServiceType } from '../../types';
import getChipColorByServiceType from '../../utils/getChipColorByServiceType';
import { formatTokenBalance } from '../../utils/polkadot';
import { cleanAllocations } from './IndependentAllocationStep';
import { RestakingProfileType } from './ManageProfileModalContainer';
import { RestakingAllocationMap } from './types';

export type ConfirmAllocationsStepProps = {
  method: RestakingProfileType;
  allocations: RestakingAllocationMap;
};

const ConfirmAllocationsStep: FC<ConfirmAllocationsStepProps> = ({
  method,
  allocations,
}) => {
  const restakedAmount = cleanAllocations(allocations).reduce(
    (acc, [, amount]) => acc.add(amount),
    new BN(0)
  );

  const cleanedAllocations = cleanAllocations(allocations);

  return (
    <div className="flex flex-row items-start gap-2 w-full">
      <div className="flex flex-col gap-2 dark:bg-mono-160 rounded-lg w-full p-4">
        <div className="flex justify-between">
          <Typography variant="body2" fw="semibold">
            Profile Type
          </Typography>

          <Chip color="dark-grey">
            {method === RestakingProfileType.Independent
              ? 'Independent'
              : 'Shared'}
          </Chip>
        </div>

        <div className="flex flex-col gap-2 mb-auto">
          {cleanedAllocations.map(([service, amount]) => (
            <AllocationItem key={service} service={service} amount={amount} />
          ))}

          {cleanedAllocations.length === 0 && (
            <Typography
              variant="body2"
              fw="normal"
              className="w-full text-center dark:bg-mono-140 rounded-lg px-3 py-2"
            >
              No allocations
            </Typography>
          )}
        </div>

        <div className="flex justify-between">
          <Typography variant="body2" fw="semibold">
            Total Restake Amount
          </Typography>

          <Typography
            variant="body2"
            fw="semibold"
            className="text-mono-0 dark:text-mono-0"
          >
            {formatTokenBalance(restakedAmount)}
          </Typography>
        </div>
      </div>

      <div className="flex flex-col gap-2 dark:bg-mono-160 rounded-lg w-full p-4 text-mono-0 dark:text-mono-0">
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

type AllocationItemProps = {
  service: ServiceType;
  amount: BN;
};

/** @internal */
const AllocationItem: FC<AllocationItemProps> = ({ service, amount }) => {
  return (
    <div className="flex items-center justify-between dark:bg-mono-140 rounded-lg px-3 py-2">
      <Chip color={getChipColorByServiceType(service)}>{service}</Chip>

      <Typography variant="body2" fw="semibold" className="dark:text-mono-0">
        {formatTokenBalance(amount)}
      </Typography>
    </div>
  );
};

export default ConfirmAllocationsStep;

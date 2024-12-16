import { BN, BN_ZERO } from '@polkadot/util';
import { InformationLine } from '@webb-tools/icons';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { TangleTokenSymbol } from '@webb-tools/tangle-shared-ui/types';
import { Chip, Typography } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { RestakingProfileType, RestakingService } from '../../types';
import { getChipColorOfServiceType } from '../../utils';
import formatTangleBalance from '../../utils/formatTangleBalance';
import { filterAllocations } from './Independent/utils';
import { RestakingAllocationMap } from './types';

export type ConfirmAllocationsStepProps = {
  profileType: RestakingProfileType;
  allocations: RestakingAllocationMap;
  sharedRestakeAmount?: BN;
};

const ConfirmAllocationsStep: FC<ConfirmAllocationsStepProps> = ({
  profileType,
  allocations,
  sharedRestakeAmount,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const isSharedVariant = profileType === RestakingProfileType.SHARED;

  if (isSharedVariant) {
    assert(
      sharedRestakeAmount !== undefined,
      'Shared restake amount should be defined for the shared profile type (did you forget to pass the shared restake amount prop?)',
    );
  }

  const restakedAmount = filterAllocations(allocations).reduce(
    (acc, [, amount]) => acc.add(amount),
    BN_ZERO,
  );

  const filteredAllocations = filterAllocations(allocations);

  const cardBaseClassName =
    'flex flex-col gap-2 bg-mono-20 dark:bg-mono-160 rounded-lg w-full p-4 border border-mono-40 dark:border-mono-140';

  // Give priority to the shared restaked amount, if provided.
  // This is because the shared restake amount is not automatically
  // calculated from the allocations, since shared roles profiles
  // do not allocate amounts per-role, but rather as a whole.
  const totalRestakedAmount = formatTangleBalance(
    isSharedVariant && sharedRestakeAmount !== undefined
      ? sharedRestakeAmount
      : restakedAmount,
    nativeTokenSymbol,
  );

  return (
    <div className="flex flex-col items-start w-full gap-2 sm:flex-row">
      <div className={cardBaseClassName}>
        <div className="flex justify-between">
          <Typography variant="body2" fw="semibold">
            Profile Type
          </Typography>

          <Chip color="dark-grey">
            {profileType === RestakingProfileType.INDEPENDENT
              ? 'Independent'
              : 'Shared'}
          </Chip>
        </div>

        <div className="flex flex-col gap-2 mb-auto">
          {isSharedVariant
            ? filteredAllocations.length > 0 && (
                <AllocationItem
                  services={Object.values(filteredAllocations).map(
                    ([service]) => service,
                  )}
                  tokenSymbol={nativeTokenSymbol}
                />
              )
            : filteredAllocations.map(([service, amount]) => (
                <AllocationItem
                  key={service}
                  services={[service]}
                  amount={amount}
                  tokenSymbol={nativeTokenSymbol}
                />
              ))}

          {filteredAllocations.length === 0 && (
            <Typography
              variant="body2"
              fw="normal"
              className="w-full px-3 py-2 text-center rounded-lg bg-mono-40 dark:bg-mono-140"
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
            className="dark:text-mono-0"
          >
            {totalRestakedAmount}
          </Typography>
        </div>
      </div>

      <div className={twMerge(cardBaseClassName, 'dark:text-mono-0')}>
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

          <ul className="pl-2 list-disc">
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

          <ul className="pl-2 list-disc">
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
  services: RestakingService[];
  amount?: BN;
  tokenSymbol: TangleTokenSymbol;
};

/** @internal */
const AllocationItem: FC<AllocationItemProps> = ({
  services,
  amount,
  tokenSymbol,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-mono-40 dark:bg-mono-140">
      <div className="flex flex-wrap gap-1">
        {services.map((service) => (
          <Chip
            key={service}
            color={getChipColorOfServiceType(service)}
            className="text-center whitespace-nowrap"
          >
            {service}
          </Chip>
        ))}
      </div>

      {amount !== undefined && (
        <Typography
          variant="body2"
          fw="semibold"
          className="text-right dark:text-mono-0"
        >
          {formatTangleBalance(amount, tokenSymbol)}
        </Typography>
      )}
    </div>
  );
};

export default ConfirmAllocationsStep;

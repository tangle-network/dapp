'use client';

import { PalletStakingRewardDestination } from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { StakingRewardsDestination } from '../../types';
import Optional from '../../utils/Optional';

const STAKING_SUBSTRATE_PAYEE_TO_LOCAL_PAYEE_MAP: Record<
  PalletStakingRewardDestination['type'],
  StakingRewardsDestination
> = {
  Staked: StakingRewardsDestination.STAKED,
  Controller: StakingRewardsDestination.CONTROLLER,
  Stash: StakingRewardsDestination.STASH,
  Account: StakingRewardsDestination.ACCOUNT,
  None: StakingRewardsDestination.NONE,
};

const useStakingRewardsDestination = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  return useApiRx<Optional<StakingRewardsDestination>>(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.staking.payee(activeSubstrateAddress).pipe(
          map((substrateRewardsDestinationOpt) => {
            if (substrateRewardsDestinationOpt.isNone) {
              return new Optional();
            }

            const substrateRewardsDestination =
              substrateRewardsDestinationOpt.unwrap();

            return new Optional(
              STAKING_SUBSTRATE_PAYEE_TO_LOCAL_PAYEE_MAP[
                substrateRewardsDestination.type
              ],
            );
          }),
        );
      },
      [activeSubstrateAddress],
    ),
  );
};

export default useStakingRewardsDestination;

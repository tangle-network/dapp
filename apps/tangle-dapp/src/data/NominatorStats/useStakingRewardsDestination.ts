import { PalletStakingRewardDestination } from '@polkadot/types/lookup';
import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import Optional from '@webb-tools/tangle-shared-ui/utils/Optional';
import { useCallback } from 'react';
import { map } from 'rxjs';

import { StakingRewardsDestination } from '../../types';

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

            return new Optional(
              STAKING_SUBSTRATE_PAYEE_TO_LOCAL_PAYEE_MAP[
                substrateRewardsDestinationOpt.unwrap().type
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

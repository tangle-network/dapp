import { useCallback } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { ValidatorReward } from '../types';
import useClaimedRewards from './useClaimedRewards';
import useErasRewardsPoints from './useErasRewardsPoints';

/**
 * Get all unclaimed rewards of the active account's nominations
 */
export default function useNominationsUnclaimedRewards() {
  const activeSubstrateAddress = useSubstrateAddress();

  // Retrieve all validators that the account has nominated
  const { result: validators } = useApiRx(
    useCallback(
      (api) => {
        if (!activeSubstrateAddress) {
          return null;
        }

        return api.query.staking
          .nominators(activeSubstrateAddress)
          .pipe(
            map((nominators) =>
              nominators.isNone
                ? null
                : nominators
                    .unwrap()
                    .targets.map((target) => target.toString()),
            ),
          );
      },
      [activeSubstrateAddress],
    ),
  );

  const { result: claimedRewards } = useClaimedRewards();

  const { result: erasRewardsPoints } = useErasRewardsPoints();

  return (validators ?? []).reduce((unclaimedRewards, validator) => {
    (erasRewardsPoints ?? []).forEach(([era, reward]) => {
      const hasClaimed = claimedRewards.get(era)?.get(validator)?.size !== 0;

      // If the reward has claimed, do nothing
      if (hasClaimed) return;

      unclaimedRewards.concat({
        era,
        eraTotalRewardPoints: reward.total,
        validatorAddress: validator,
        validatorRewardPoints: reward.individual.get(validator) ?? 0,
      });
    });

    return unclaimedRewards;
  }, [] as ValidatorReward[]);
}

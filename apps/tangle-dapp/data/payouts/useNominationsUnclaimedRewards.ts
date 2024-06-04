import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { ValidatorReward } from '../types';
import useClaimedRewards from './useClaimedRewards';
import useErasRewardsPoints from './useErasRewardsPoints';

/**
 * Defined constant empty array to return on every render
 * to make sure it's always the same reference
 * and avoid unnecessary re-renders
 */
const EMPTY_ARRAY: ValidatorReward[] = [];

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

  return useMemo(() => {
    // Returned empty array if the data is not ready
    if (
      validators === null ||
      validators.length === 0 ||
      erasRewardsPoints === null ||
      erasRewardsPoints.length === 0 ||
      claimedRewards === null ||
      claimedRewards.size === 0
    ) {
      return EMPTY_ARRAY;
    }

    return validators.reduce((unclaimedRewards, validator) => {
      erasRewardsPoints.forEach(([era, reward]) => {
        const claimedErasLength = claimedRewards.get(era)?.get(validator)?.size;
        const hasClaimed = claimedErasLength ? claimedErasLength >= 1 : false;

        // If the reward has claimed, do nothing
        if (hasClaimed) return;

        unclaimedRewards.push({
          era,
          eraTotalRewardPoints: reward.total,
          validatorAddress: validator,
          validatorRewardPoints: reward.individual.get(validator) ?? 0,
        });
      });

      return unclaimedRewards;
    }, [] as ValidatorReward[]);
  }, [claimedRewards, erasRewardsPoints, validators]);
}

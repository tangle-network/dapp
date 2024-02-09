import { ApiPromise } from '@polkadot/api';
import { StakingLedger } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import assert from 'assert';
import { useCallback } from 'react';

import { PolkadotApiSwrKey } from '../../hooks/usePolkadotApi';
import useStakingLedger, {
  StakingLedgerFetcher,
} from '../../hooks/useStakingLedger';

const sumStakerRewardsInClaimedEraRange = async (
  ledger: StakingLedger,
  api: ApiPromise,
  startEra: number,
  endEra: number
) => {
  assert(startEra <= endEra, 'Start era should be before end era');
  assert(startEra >= 0, 'Start era should be positive');

  // If the staker has never claimed rewards, there is nothing to do.
  if (ledger.claimedRewards.length === 0) {
    return new BN(0);
  }

  let rewardSum = new BN(0);

  for (let eraIndex = startEra; eraIndex <= endEra; eraIndex++) {
    // Get the total rewards pool for the era.
    const totalRewardsForEraOpt = await api.query.staking.erasValidatorReward(
      eraIndex
    );

    // If the rewards is not yet available for the given era,
    // skip it.
    if (totalRewardsForEraOpt.isNone) {
      continue;
    }

    const totalRewardsForEra = totalRewardsForEraOpt.unwrap();

    // Get the total points and the staker's points for the era.
    const pointsForEra = await api.query.staking.erasRewardPoints(eraIndex);
    const totalPoints = pointsForEra.total.toBn();
    const stashPoints = pointsForEra.individual.get(ledger.stash) || new BN(0);

    // Avoid division by zero.
    const safeTotalPoints = totalPoints.isZero() ? new BN(1) : totalPoints;

    // Calculate the staker's share of the rewards for the era:
    // stakerShareForEra = totalRewardsForEra * stakerPoints / totalPoints
    const stakerShareForEra = totalRewardsForEra
      .toBn()
      .mul(stashPoints)
      .div(safeTotalPoints);

    // Add the staker's share to the total pending rewards.
    rewardSum = rewardSum.add(stakerShareForEra);
  }

  return rewardSum;
};

const fetchPendingRewards: StakingLedgerFetcher<BN> = async (ledger, api) => {
  const lastClaimedEraIndex =
    ledger.claimedRewards[ledger.claimedRewards.length - 1].toNumber();

  const currentEraIndexOpt = await api.query.staking.currentEra();

  // Staking is not yet active, hasn't started, or
  // between genesis and the start of the first era?
  // Either way, there should be no rewards under those
  // circumstances.
  if (currentEraIndexOpt.isNone) {
    return new BN(0);
  }

  const currentEraIndex = currentEraIndexOpt.unwrap().toNumber();

  // Pending rewards = Sum of all rewards in unclaimed eras.
  return sumStakerRewardsInClaimedEraRange(
    ledger,
    api,
    // Exclude the last claimed era.
    lastClaimedEraIndex + 1,
    currentEraIndex
  );
};

const useStakingPendingRewards = () => {
  const { value: pendingRewards } = useStakingLedger(
    useCallback(async (ledger, api) => fetchPendingRewards(ledger, api), []),
    PolkadotApiSwrKey.StakingRewards
  );

  return pendingRewards;
};

export default useStakingPendingRewards;

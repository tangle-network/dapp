import assert from 'assert';
import Decimal from 'decimal.js';
import { useCallback, useMemo } from 'react';

import useApi from '../../../hooks/useApi';
import useAllStakingExposures from '../../staking/useAllStakingExposures';
import useEraTotalRewards2 from '../../staking/useEraTotalRewards2';
import useLsBondedPools from '../useLsBondedPools';
import useLsPoolBondedAccounts from '../useLsPoolBondedAccounts';
import useActiveEraIndex from './useActiveEraIndex';
import useEraRewardPoints from './useEraRewards';

/**
 * Calculate the compound APY for all liquid staking pools, and
 * return a map of `poolId -> APY`.
 *
 * The worst-case scenario performance of this hook is `O(p * h)`, where `p`
 * is the number of pools and `h` is the history depth. However, since the
 * history depth is a constant value (typically `80`), the performance is
 * effectively `O(p)`.
 */
const useLsPoolCompoundApys = (): Map<number, Decimal> | null => {
  const activeEraIndex = useActiveEraIndex();

  const { result: rawHistoryDepth } = useApi(
    useCallback((api) => api.consts.staking.historyDepth, []),
  );

  const historyDepth = rawHistoryDepth?.toNumber() ?? null;
  const bondedPools = useLsBondedPools();
  const poolBondedAccounts = useLsPoolBondedAccounts();
  const eraRewardPoints = useEraRewardPoints();
  const { result: allExposures } = useAllStakingExposures();
  const { data: eraTotalRewards } = useEraTotalRewards2();

  const apys = useMemo(() => {
    if (
      bondedPools === null ||
      historyDepth === null ||
      eraRewardPoints === null ||
      activeEraIndex === null ||
      poolBondedAccounts === null ||
      allExposures === null ||
      eraTotalRewards === null
    ) {
      return null;
    }

    const apys = new Map<number, Decimal>();

    for (const [poolId] of bondedPools) {
      let perEraReturnSum = new Decimal(0);
      const poolBondedAccountAddress = poolBondedAccounts.get(poolId);

      // Instead of using the history depth when calculating the avg.,
      // use a counter, since some eras are skipped due to missing data.
      let actualErasConsidered = 0;

      assert(
        poolBondedAccountAddress !== undefined,
        'Each pool id should always have a corresponding bonded account entry',
      );

      // Calculate the avg. per-era return rate for the last MAX_ERAS eras
      // for the current pool.
      for (let i = activeEraIndex - historyDepth; i < activeEraIndex; i++) {
        const poolExposureAtEra = allExposures.find(
          (entry) =>
            entry.address === poolBondedAccountAddress && entry.eraIndex === i,
        );

        // TODO: Shouldn't all eras have an exposure entry?
        // No exposure entry exists at this era for this pool. Skip.
        if (poolExposureAtEra === undefined) {
          continue;
        }

        // TODO: Need to get the specific portion of points & stake for the pool X (its bounded account), not just the entire era's.
        const rewardPointsAtEra = eraRewardPoints.get(i);

        // TODO: Shouldn't all eras have a rewards entry?
        // No rewards data exists at this era. Skip.
        if (rewardPointsAtEra === undefined) {
          continue;
        }

        const totalRewardsAtEra = eraTotalRewards.get(i);

        // TODO: Shouldn't all eras have a total rewards entry? Would the total rewards ever be zero?
        // No rewards entry exists at this era. Skip.
        // Also ignore if the total rewards at this era is zero, to avoid division by zero.
        if (totalRewardsAtEra === undefined || totalRewardsAtEra.isZero()) {
          continue;
        }

        const poolPoints =
          rewardPointsAtEra.individual.get(poolBondedAccountAddress) ?? 0;

        const poolRewardAmount = totalRewardsAtEra
          .muln(poolPoints)
          .divn(rewardPointsAtEra.total);

        const eraTotalStakeForPool = poolExposureAtEra.metadata.total.toBn();

        // TODO: Shouldn't this also be considered for the avg.? Count it as zero?
        // Avoid potential division by zero.
        if (eraTotalStakeForPool.isZero()) {
          continue;
        }

        // Per-era return rate =
        // Pool's reward amount at era / total tokens staked by that pool at era
        const erpt = new Decimal(poolRewardAmount.toString()).div(
          eraTotalStakeForPool.toString(),
        );

        perEraReturnSum = perEraReturnSum.plus(erpt);
        actualErasConsidered += 1;
      }

      // Skip if no eras were considered, which would mean
      // that the pool has no previous nominations.
      if (actualErasConsidered === 0) {
        continue;
      }

      const avgPerEraReturnRate = perEraReturnSum.div(actualErasConsidered);

      // APY = (avg(ERPT) + 1) ^ 365 - 1.
      // The reason why 365 is used is because the era duration is 24 hours (1 day).
      const apy = avgPerEraReturnRate.plus(1).pow(365).minus(1);

      apys.set(poolId, apy);
    }

    return apys;
  }, [
    bondedPools,
    historyDepth,
    eraRewardPoints,
    activeEraIndex,
    poolBondedAccounts,
    allExposures,
    eraTotalRewards,
  ]);

  return apys;
};

export default useLsPoolCompoundApys;

/**
 * Hook for calculating expected rewards and APY projections.
 * Combines pending rewards, vault summaries, delegator positions, and epoch info.
 */

import { useMemo } from 'react';
import { formatUnits } from 'viem';
import usePendingRewards from './usePendingRewards';
import useVaultSummaries from './useVaultSummaries';
import useDelegatorPositions, { LOCK_MULTIPLIERS, LockDuration } from './useDelegatorPositions';
import useEpochInfo from './useEpochInfo';

export interface ApyRange {
  min: number; // Base APY without lock bonus
  max: number; // Max APY with 6-month lock (1.6x)
  current: number; // Current APY based on user's lock multiplier
}

export interface ExpectedRewardsData {
  // Claimable now
  pendingRewards: bigint;
  formattedPendingRewards: string;
  hasRewards: boolean;

  // Projections
  projectedNextEpoch: bigint;
  formattedProjectedNextEpoch: string;
  projectedDailyRewards: bigint;
  formattedProjectedDailyRewards: string;

  // APY estimates
  estimatedApyRange: ApyRange;
  formattedApyRange: string;

  // User position info
  userShare: number; // Percentage of total vault score
  currentMultiplier: number; // User's weighted average lock multiplier
  totalStaked: bigint;
  formattedTotalStaked: string;

  // Pool info
  poolBalance: bigint;
  epochBudget: bigint;
  stakingBudgetPerEpoch: bigint;

  // Metadata
  lastUpdated: Date;
  isPoolDepleted: boolean;
  hasNoStake: boolean;
}

interface UseExpectedRewardsOptions {
  enabled?: boolean;
}

const formatValue = (value: bigint, decimals = 18): string => {
  const formatted = formatUnits(value, decimals);
  const num = parseFloat(formatted);
  if (num === 0) {
    return '0';
  }
  if (num < 0.0001 && num > 0) {
    return '< 0.0001';
  }
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
};

const formatApy = (apy: number): string => {
  if (apy === 0 || !isFinite(apy)) {
    return '0%';
  }
  if (apy < 0.01) {
    return '< 0.01%';
  }
  return `${apy.toFixed(2)}%`;
};

const useExpectedRewards = (options?: UseExpectedRewardsOptions) => {
  const enabled = options?.enabled ?? true;

  const {
    data: pendingRewardsData,
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = usePendingRewards({ enabled });

  const {
    data: vaultSummaries,
    isLoading: isVaultsLoading,
    refetch: refetchVaults,
  } = useVaultSummaries({ enabled });

  const {
    data: delegatorPositions,
    isLoading: isPositionsLoading,
    refetch: refetchPositions,
  } = useDelegatorPositions({ enabled });

  const {
    data: epochInfo,
    isLoading: isEpochLoading,
    refetch: refetchEpoch,
  } = useEpochInfo({ enabled });

  const data = useMemo<ExpectedRewardsData | null>(() => {
    // Epoch info is required for projections
    if (!epochInfo) {
      return null;
    }

    const pendingRewards = pendingRewardsData?.totalPendingRewards ?? BigInt(0);
    const hasRewards = pendingRewards > BigInt(0);

    const userTotalBoostedScore = delegatorPositions?.totalBoostedScore ?? BigInt(0);
    const userTotalStaked = delegatorPositions?.totalStakedAmount ?? BigInt(0);
    const currentMultiplier = delegatorPositions?.weightedAvgMultiplier ?? 1.0;
    const vaultTotalScore = vaultSummaries?.totalScore ?? BigInt(0);

    const hasNoStake = userTotalStaked === BigInt(0);
    const isPoolDepleted = epochInfo.poolBalance === BigInt(0);

    // Calculate user's share of the total vault score
    let userShare = 0;
    if (vaultTotalScore > BigInt(0) && userTotalBoostedScore > BigInt(0)) {
      // Use high precision calculation
      userShare = Number((userTotalBoostedScore * BigInt(1000000)) / vaultTotalScore) / 1000000;
    }

    // Calculate projected rewards for next epoch
    let projectedNextEpoch = BigInt(0);
    if (userShare > 0 && epochInfo.stakingBudgetPerEpoch > BigInt(0)) {
      // User's projected share of the staking budget
      projectedNextEpoch =
        (epochInfo.stakingBudgetPerEpoch * BigInt(Math.floor(userShare * 1000000))) /
        BigInt(1000000);
    }

    // Calculate projected daily rewards
    // Daily = projected per epoch * epochs per day
    const epochLengthSeconds = Number(epochInfo.epochLength);
    const epochsPerDay = epochLengthSeconds > 0 ? 86400 / epochLengthSeconds : 0;
    const projectedDailyRewards =
      epochsPerDay > 0
        ? (projectedNextEpoch * BigInt(Math.floor(epochsPerDay * 100))) / BigInt(100)
        : BigInt(0);

    // Calculate APY range
    // Base APY = (yearly rewards / stake value) * 100
    // Using staking budget per epoch * epochs per year as yearly rewards estimate
    let baseApy = 0;
    if (userTotalStaked > BigInt(0) && epochInfo.epochsPerYear > 0 && userShare > 0) {
      const yearlyProjectedRewards =
        (epochInfo.stakingBudgetPerEpoch *
          BigInt(Math.floor(userShare * 1000000)) *
          BigInt(epochInfo.epochsPerYear)) /
        BigInt(1000000);

      // APY = (yearly rewards / stake) * 100
      const apyBigInt =
        (yearlyProjectedRewards * BigInt(10000)) / userTotalStaked;
      baseApy = Number(apyBigInt) / 100;
    }

    // APY range accounts for lock multipliers
    // Min: no lock bonus (1.0x), Max: 6-month lock (1.6x)
    // We divide by current multiplier to get the "base" APY, then multiply by lock multipliers
    const baseApyNormalized = currentMultiplier > 0 ? baseApy / currentMultiplier : baseApy;
    const minApy = baseApyNormalized * (LOCK_MULTIPLIERS[LockDuration.None] / 10000);
    const maxApy = baseApyNormalized * (LOCK_MULTIPLIERS[LockDuration.SixMonths] / 10000);

    const estimatedApyRange: ApyRange = {
      min: minApy,
      max: maxApy,
      current: baseApy,
    };

    // Format APY range string
    let formattedApyRange: string;
    if (minApy === 0 && maxApy === 0) {
      formattedApyRange = '--';
    } else if (minApy === maxApy) {
      formattedApyRange = formatApy(minApy);
    } else {
      formattedApyRange = `${formatApy(minApy)} - ${formatApy(maxApy)}`;
    }

    return {
      // Claimable now
      pendingRewards,
      formattedPendingRewards: formatValue(pendingRewards),
      hasRewards,

      // Projections
      projectedNextEpoch,
      formattedProjectedNextEpoch: formatValue(projectedNextEpoch),
      projectedDailyRewards,
      formattedProjectedDailyRewards: formatValue(projectedDailyRewards),

      // APY estimates
      estimatedApyRange,
      formattedApyRange,

      // User position info
      userShare,
      currentMultiplier,
      totalStaked: userTotalStaked,
      formattedTotalStaked: formatValue(userTotalStaked),

      // Pool info
      poolBalance: epochInfo.poolBalance,
      epochBudget: epochInfo.epochBudget,
      stakingBudgetPerEpoch: epochInfo.stakingBudgetPerEpoch,

      // Metadata
      lastUpdated: new Date(),
      isPoolDepleted,
      hasNoStake,
    };
  }, [pendingRewardsData, vaultSummaries, delegatorPositions, epochInfo]);

  const refetch = async () => {
    await Promise.all([
      refetchPending(),
      refetchVaults(),
      refetchPositions(),
      refetchEpoch(),
    ]);
  };

  return {
    data,
    isLoading:
      isPendingLoading || isVaultsLoading || isPositionsLoading || isEpochLoading,
    isError: false, // Individual hooks handle their errors
    refetch,
  };
};

export default useExpectedRewards;

/**
 * Hook for fetching user staking statistics.
 * Uses GraphQL for indexed data and RewardVaults for pending rewards.
 */

import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import {
  useDelegator,
  useCurrentRoundNumber,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import usePendingRewards from '../rewards/usePendingRewards';
import useDelegatorPositions from '../rewards/useDelegatorPositions';

export interface UserStakingStats {
  // Total Value Staked Card
  totalDeposited: bigint;
  totalDelegated: bigint;
  withdrawQueueAmount: bigint;
  withdrawableAmount: bigint;
  pendingUndelegateAmount: bigint;

  // Claimable Reward Value Card
  pendingRewards: bigint;
  activeBalance: bigint;

  // Formatted values (for display)
  formatted: {
    totalDeposited: string;
    totalDelegated: string;
    withdrawQueueAmount: string;
    withdrawableAmount: string;
    pendingUndelegateAmount: string;
    pendingRewards: string;
    activeBalance: string;
  };
}

const useUserStakingStats = () => {
  const { address } = useAccount();

  // Get current round from GraphQL
  const { data: currentRound } = useCurrentRoundNumber();

  // Get delegator data from GraphQL (for indexed aggregate data)
  const {
    data: delegator,
    isLoading: isDelegatorLoading,
    error: delegatorError,
    refetch: refetchDelegator,
  } = useDelegator(address);

  // Fetch pending rewards from RewardVaults contract
  const {
    data: pendingRewardsResult,
    isLoading: isPendingRewardsLoading,
    refetch: refetchPendingRewards,
  } = usePendingRewards();

  // Contract fallback for local testnets and fresh deployments where the
  // indexer may not have a delegator row yet.
  const {
    data: delegatorPositions,
    isLoading: isDelegatorPositionsLoading,
    refetch: refetchDelegatorPositions,
  } = useDelegatorPositions();

  const stats = useMemo<UserStakingStats | null>(() => {
    if (
      !address ||
      (!delegator && !pendingRewardsResult && !delegatorPositions)
    ) {
      return null;
    }

    const currentRoundNum = currentRound ?? BigInt(0);

    // Calculate withdraw queue (pending withdrawals not yet ready)
    let withdrawQueueAmount = BigInt(0);
    let withdrawableAmount = BigInt(0);

    if (delegator) {
      for (const req of delegator.withdrawRequests) {
        if (req.status === 'PENDING') {
          if (req.readyAtRound <= currentRoundNum) {
            withdrawableAmount += req.amount;
          } else {
            withdrawQueueAmount += req.amount;
          }
        }
      }
    }

    // Calculate pending undelegate amounts (note: unstakeRequests is the GraphQL field name)
    let pendingUndelegateAmount = BigInt(0);
    if (delegator) {
      for (const req of delegator.unstakeRequests) {
        if (req.status === 'PENDING') {
          pendingUndelegateAmount += req.estimatedAmount;
        }
      }
    }

    const pendingRewards =
      pendingRewardsResult?.totalPendingRewards ?? BigInt(0);

    // Active balance is the delegated amount (earning rewards). Prefer indexed
    // aggregates when present; otherwise use RewardVaults positions.
    const activeBalance =
      delegator?.totalDelegated ??
      delegatorPositions?.totalStakedAmount ??
      BigInt(0);

    const format = (value: bigint) => {
      const formatted = formatUnits(value, 18);
      const num = parseFloat(formatted);
      if (num === 0) return '0';
      if (num < 0.0001 && num > 0) return '< 0.0001';
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      });
    };

    return {
      totalDeposited: delegator?.totalDeposited ?? activeBalance,
      totalDelegated: delegator?.totalDelegated ?? activeBalance,
      withdrawQueueAmount,
      withdrawableAmount,
      pendingUndelegateAmount,
      pendingRewards,
      activeBalance,
      formatted: {
        totalDeposited: format(delegator?.totalDeposited ?? activeBalance),
        totalDelegated: format(delegator?.totalDelegated ?? activeBalance),
        withdrawQueueAmount: format(withdrawQueueAmount),
        withdrawableAmount: format(withdrawableAmount),
        pendingUndelegateAmount: format(pendingUndelegateAmount),
        pendingRewards: format(pendingRewards),
        activeBalance: format(activeBalance),
      },
    };
  }, [
    address,
    delegator,
    currentRound,
    pendingRewardsResult,
    delegatorPositions,
  ]);

  const refetch = async () => {
    await Promise.all([
      refetchDelegator(),
      refetchPendingRewards(),
      refetchDelegatorPositions(),
    ]);
  };

  return {
    data: stats,
    isLoading:
      isPendingRewardsLoading ||
      isDelegatorPositionsLoading ||
      (isDelegatorLoading && !delegator),
    isError: !!delegatorError && !pendingRewardsResult && !delegatorPositions,
    error:
      !!delegatorError && !pendingRewardsResult && !delegatorPositions
        ? delegatorError
        : null,
    refetch,
  };
};

export default useUserStakingStats;

/**
 * Hook for fetching user restaking statistics.
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

export interface UserRestakingStats {
  // Total Value Restaked Card
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

const useUserRestakingStats = () => {
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

  const stats = useMemo<UserRestakingStats | null>(() => {
    if (!delegator) {
      return null;
    }

    const currentRoundNum = currentRound ?? BigInt(0);

    // Calculate withdraw queue (pending withdrawals not yet ready)
    let withdrawQueueAmount = BigInt(0);
    let withdrawableAmount = BigInt(0);

    for (const req of delegator.withdrawRequests) {
      if (req.status === 'PENDING') {
        if (req.readyAtRound <= currentRoundNum) {
          withdrawableAmount += req.amount;
        } else {
          withdrawQueueAmount += req.amount;
        }
      }
    }

    // Calculate pending undelegate amounts (note: unstakeRequests is the GraphQL field name)
    let pendingUndelegateAmount = BigInt(0);
    for (const req of delegator.unstakeRequests) {
      if (req.status === 'PENDING') {
        pendingUndelegateAmount += req.estimatedAmount;
      }
    }

    const pendingRewards =
      pendingRewardsResult?.totalPendingRewards ?? BigInt(0);

    // Active balance is the delegated amount (earning rewards)
    const activeBalance = delegator.totalDelegated;

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
      totalDeposited: delegator.totalDeposited,
      totalDelegated: delegator.totalDelegated,
      withdrawQueueAmount,
      withdrawableAmount,
      pendingUndelegateAmount,
      pendingRewards,
      activeBalance,
      formatted: {
        totalDeposited: format(delegator.totalDeposited),
        totalDelegated: format(delegator.totalDelegated),
        withdrawQueueAmount: format(withdrawQueueAmount),
        withdrawableAmount: format(withdrawableAmount),
        pendingUndelegateAmount: format(pendingUndelegateAmount),
        pendingRewards: format(pendingRewards),
        activeBalance: format(activeBalance),
      },
    };
  }, [delegator, currentRound, pendingRewardsResult]);

  const refetch = async () => {
    await Promise.all([refetchDelegator(), refetchPendingRewards()]);
  };

  return {
    data: stats,
    isLoading: isDelegatorLoading || isPendingRewardsLoading,
    isError: !!delegatorError,
    error: delegatorError,
    refetch,
  };
};

export default useUserRestakingStats;

/**
 * Hook for fetching user restaking statistics.
 * Uses GraphQL for indexed data and contract calls for real-time rewards.
 */

import { useMemo } from 'react';
import { Address, formatUnits } from 'viem';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import {
  useDelegator,
  useCurrentRoundNumber,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import MULTI_ASSET_DELEGATION_ABI from '@tangle-network/tangle-shared-ui/abi/multiAssetDelegation';

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
  const chainId = useChainId();

  // Get current round from GraphQL
  const { data: currentRound } = useCurrentRoundNumber();

  // Get delegator data from GraphQL (for indexed aggregate data)
  const {
    data: delegator,
    isLoading: isDelegatorLoading,
    error: delegatorError,
    refetch: refetchDelegator,
  } = useDelegator(address);

  // Get contracts for the current chain
  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    contracts = null;
  }

  // Get pending rewards from contract (real-time)
  const {
    data: pendingRewardsData,
    isLoading: isRewardsLoading,
    error: rewardsError,
    refetch: refetchRewards,
  } = useReadContract({
    address: contracts?.multiAssetDelegation as Address,
    abi: MULTI_ASSET_DELEGATION_ABI,
    functionName: 'getPendingDelegatorRewards',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts && !!address,
      refetchInterval: 15000, // Refresh every 15 seconds
    },
  });

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

    const pendingRewards = (pendingRewardsData as bigint) ?? BigInt(0);

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
  }, [delegator, currentRound, pendingRewardsData]);

  const refetch = async () => {
    await Promise.all([refetchDelegator(), refetchRewards()]);
  };

  return {
    data: stats,
    isLoading: isDelegatorLoading || isRewardsLoading,
    isError: !!delegatorError || !!rewardsError,
    error: delegatorError || rewardsError,
    refetch,
  };
};

export default useUserRestakingStats;

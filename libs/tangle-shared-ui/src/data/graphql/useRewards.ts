/**
 * Hooks for fetching and claiming rewards.
 */

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  usePublicClient,
  useWalletClient,
  useChainId,
  useAccount,
} from 'wagmi';
import { Address, encodeFunctionData, type Hash, formatUnits } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';

// Reward entry from indexer
export interface RewardEntry {
  id: string;
  account: Address;
  token: Address;
  amount: bigint;
  serviceId: bigint;
  blueprintId: bigint;
  timestamp: bigint;
  claimed: boolean;
}

// Aggregated rewards by token
export interface AggregatedRewards {
  token: Address;
  symbol: string;
  decimals: number;
  pending: bigint;
  claimed: bigint;
  total: bigint;
}

// Raw response from GraphQL
interface RewardQueryResponse {
  Reward: Array<{
    id: string;
    account: string;
    token: string;
    amount: string;
    serviceId: string;
    blueprintId: string;
    timestamp: string;
    claimed: boolean;
  }>;
}

// Fetch rewards for an account
const fetchRewardsByAccount = async (
  account: Address,
  network?: EnvioNetwork,
): Promise<RewardEntry[]> => {
  const query = `
    query GetRewardsByAccount($account: String!) {
      Reward(
        where: { account: { _eq: $account } }
        order_by: { timestamp: desc }
      ) {
        id
        account
        token
        amount
        serviceId
        blueprintId
        timestamp
        claimed
      }
    }
  `;

  try {
    const result = await executeEnvioGraphQL<
      RewardQueryResponse,
      { account: string }
    >(query, { account: account.toLowerCase() }, network);

    return (result.data.Reward ?? []).map((reward) => ({
      id: reward.id,
      account: reward.account as Address,
      token: reward.token as Address,
      amount: BigInt(reward.amount),
      serviceId: BigInt(reward.serviceId),
      blueprintId: BigInt(reward.blueprintId),
      timestamp: BigInt(reward.timestamp),
      claimed: reward.claimed,
    }));
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
    return [];
  }
};

/**
 * Hook to fetch pending rewards from contract.
 */
export const usePendingRewards = (options?: {
  token?: Address;
  enabled?: boolean;
}) => {
  const { token, enabled = true } = options ?? {};
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['rewards', 'pending', address, token, chainId],
    queryFn: async () => {
      if (!address || !publicClient) return BigInt(0);

      const contracts = getContractsByChainId(chainId);

      try {
        // Call pendingRewards on the contract
        const result = await publicClient.readContract({
          address: contracts.tangle,
          abi: TANGLE_ABI,
          functionName: 'pendingRewards',
          args: token ? [address, token] : [address],
        });

        return result as bigint;
      } catch (error) {
        console.error('Failed to fetch pending rewards:', error);
        return BigInt(0);
      }
    },
    enabled: enabled && !!address && !!publicClient,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
  });
};

/**
 * Hook to fetch reward history from indexer.
 */
export const useRewardHistory = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const { address } = useAccount();

  return useQuery({
    queryKey: ['rewards', 'history', address, network],
    queryFn: async () => {
      if (!address) return [];
      return fetchRewardsByAccount(address, network);
    },
    enabled: enabled && !!address,
    staleTime: 60_000, // 1 minute
  });
};

// Claim rewards hook
export type ClaimRewardsStatus = 'idle' | 'pending' | 'success' | 'error';

export interface UseClaimRewardsTxReturn {
  claimRewards: (token?: Address) => Promise<Hash | null>;
  status: ClaimRewardsStatus;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook to claim pending rewards.
 *
 * @example
 * ```tsx
 * const { claimRewards, status } = useClaimRewardsTx();
 *
 * // Claim all rewards
 * await claimRewards();
 *
 * // Claim rewards for specific token
 * await claimRewards('0x...');
 * ```
 */
export const useClaimRewardsTx = (): UseClaimRewardsTxReturn => {
  const [status, setStatus] = useState<ClaimRewardsStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const claimRewards = useCallback(
    async (token?: Address): Promise<Hash | null> => {
      if (!walletClient || !publicClient) {
        setError(new Error('Wallet not connected'));
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');
        setError(null);

        const contracts = getContractsByChainId(chainId);

        // Encode the claimRewards call
        const data = token
          ? encodeFunctionData({
              abi: TANGLE_ABI,
              functionName: 'claimRewards',
              args: [token],
            })
          : encodeFunctionData({
              abi: TANGLE_ABI,
              functionName: 'claimRewards',
              args: [],
            });

        // Send the transaction
        const hash = await walletClient.sendTransaction({
          to: contracts.tangle,
          data,
        });

        // Wait for confirmation
        await publicClient.waitForTransactionReceipt({ hash });

        setStatus('success');
        return hash;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to claim rewards');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    claimRewards,
    status,
    error,
    reset,
  };
};

/**
 * Format reward amount for display.
 */
export const formatRewardAmount = (
  amount: bigint,
  decimals: number = 18,
): string => {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
};

export default usePendingRewards;

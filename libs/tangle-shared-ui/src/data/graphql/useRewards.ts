/**
 * Hooks for fetching and claiming rewards.
 */

import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePublicClient, useChainId, useAccount } from 'wagmi';
import { Address, formatUnits, Hash, zeroAddress } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';
import useContractWrite, { TxStatus } from '../../hooks/useContractWrite';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';

export interface RewardClaimEntry {
  id: string;
  account: Address;
  token: Address;
  amount: bigint;
  claimedAt: bigint;
  txHash: `0x${string}` | string;
}

/**
 * @deprecated Use `RewardClaimEntry`. Kept temporarily to avoid breakages.
 */
export type RewardEntry = RewardClaimEntry;

export interface PendingRewardsByTokenEntry {
  token: Address;
  isNative: boolean;
  pending: bigint;
}

export interface PendingRewardsByToken {
  rewards: PendingRewardsByTokenEntry[];
  totalPending: bigint;
  hasRewards: boolean;
}

// Aggregated rewards by token (legacy type kept for compatibility)
export interface AggregatedRewards {
  token: Address;
  symbol: string;
  decimals: number;
  pending: bigint;
  claimed: bigint;
  total: bigint;
}

// Raw response from GraphQL
interface RewardClaimsQueryResponse {
  RewardClaim: Array<{
    id: string;
    account: string;
    token: string;
    amount: string;
    claimedAt: string;
    txHash: string;
  }>;
}

const getContracts = (chainId: number) => {
  try {
    return getContractsByChainId(chainId);
  } catch {
    return null;
  }
};

const throwIfGraphQLErrors = (
  errors: Array<{ message: string }> | undefined,
  context: string,
) => {
  if (!errors || errors.length === 0) {
    return;
  }

  const message = errors.map((error) => error.message).join('; ');
  throw new Error(`${context}: ${message}`);
};

// Fetch reward claims for an account.
const fetchRewardClaimsByAccount = async (
  account: Address,
  network?: EnvioNetwork,
): Promise<RewardClaimEntry[]> => {
  const query = `
    query GetRewardClaimsByAccount($account: String!) {
      RewardClaim(
        where: { account: { _eq: $account } }
        order_by: { claimedAt: desc }
      ) {
        id
        account
        token
        amount
        claimedAt
        txHash
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    RewardClaimsQueryResponse,
    { account: string }
  >(query, { account: account.toLowerCase() }, network);

  throwIfGraphQLErrors(result.errors, 'Failed to fetch reward claims');

  return (result.data.RewardClaim ?? []).map((claim) => ({
    id: claim.id,
    account: claim.account as Address,
    token: claim.token as Address,
    amount: BigInt(claim.amount),
    claimedAt: BigInt(claim.claimedAt),
    txHash: claim.txHash,
  }));
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
  const contracts = useMemo(() => getContracts(chainId), [chainId]);

  return useQuery({
    queryKey: ['rewards', 'pending', address, token, chainId],
    queryFn: async () => {
      if (!address || !publicClient) return BigInt(0);
      if (!contracts) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      const result = await publicClient.readContract({
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'pendingRewards',
        args: token ? [address, token] : [address],
      });

      return result as bigint;
    },
    enabled: enabled && !!address && !!publicClient && !!contracts,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
  });
};

/**
 * Hook to fetch tokens that currently have pending rewards.
 */
export const useRewardTokens = (options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options ?? {};
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const contracts = useMemo(() => getContracts(chainId), [chainId]);

  return useQuery({
    queryKey: ['rewards', 'tokens', address, chainId],
    queryFn: async () => {
      if (!address || !publicClient) return [] as Address[];
      if (!contracts) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      const tokens = (await publicClient.readContract({
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'rewardTokens',
        args: [address],
      })) as Address[];

      const deduped = new Map(tokens.map((token) => [token.toLowerCase(), token]));
      return [...deduped.values()];
    },
    enabled: enabled && !!address && !!publicClient && !!contracts,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
};

/**
 * Hook to fetch pending rewards grouped by token.
 */
export const usePendingRewardsByToken = (options?: {
  includeNative?: boolean;
  enabled?: boolean;
}) => {
  const { includeNative = true, enabled = true } = options ?? {};
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const contracts = useMemo(() => getContracts(chainId), [chainId]);

  return useQuery({
    queryKey: [
      'rewards',
      'pending',
      'byToken',
      address,
      chainId,
      includeNative,
    ],
    queryFn: async (): Promise<PendingRewardsByToken> => {
      if (!address || !publicClient) {
        return {
          rewards: [],
          totalPending: BigInt(0),
          hasRewards: false,
        };
      }
      if (!contracts) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      const rewardTokens = (await publicClient.readContract({
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'rewardTokens',
        args: [address],
      })) as Address[];

      const uniqueTokens = [...new Set(rewardTokens.map((token) => token.toLowerCase()))]
        .map((token) => token as Address);

      const tokenRewards = await Promise.all(
        uniqueTokens.map(async (token) => {
          const pending = (await publicClient.readContract({
            address: contracts.tangle,
            abi: TANGLE_ABI,
            functionName: 'pendingRewards',
            args: [address, token],
          })) as bigint;

          return {
            token,
            isNative: token.toLowerCase() === zeroAddress,
            pending,
          } satisfies PendingRewardsByTokenEntry;
        }),
      );

      const nonZeroRewards = tokenRewards.filter((entry) => entry.pending > BigInt(0));
      const hasNative = nonZeroRewards.some(
        (entry) => entry.token.toLowerCase() === zeroAddress,
      );

      if (includeNative && !hasNative) {
        const nativePending = (await publicClient.readContract({
          address: contracts.tangle,
          abi: TANGLE_ABI,
          functionName: 'pendingRewards',
          args: [address],
        })) as bigint;

        if (nativePending > BigInt(0)) {
          nonZeroRewards.unshift({
            token: zeroAddress,
            isNative: true,
            pending: nativePending,
          });
        }
      }

      const totalPending = nonZeroRewards.reduce(
        (total, reward) => total + reward.pending,
        BigInt(0),
      );

      return {
        rewards: nonZeroRewards,
        totalPending,
        hasRewards: totalPending > BigInt(0),
      };
    },
    enabled: enabled && !!address && !!publicClient && !!contracts,
    staleTime: 15_000,
    refetchInterval: 30_000,
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
  const chainId = useChainId();
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(chainId);

  return useQuery({
    queryKey: ['rewards', 'claims', address, resolvedNetwork],
    queryFn: async () => {
      if (!address) return [];
      return fetchRewardClaimsByAccount(address, resolvedNetwork);
    },
    enabled: enabled && !!address,
    staleTime: 60_000, // 1 minute
  });
};

// Claim rewards hook
export type ClaimRewardsStatus = 'idle' | 'pending' | 'success' | 'error';

export interface UseClaimRewardsTxReturn {
  claimNative: () => Promise<Hash | null>;
  claimToken: (token: Address) => Promise<Hash | null>;
  claimBatch: (tokens: Address[]) => Promise<Hash | null>;
  claimAllTokens: () => Promise<Hash | null>;
  /**
   * @deprecated Use explicit methods (`claimNative`, `claimToken`, `claimBatch`, `claimAllTokens`).
   */
  claimRewards: (token?: Address) => Promise<Hash | null>;
  status: ClaimRewardsStatus;
  error: Error | null;
  reset: () => void;
}

type ClaimExecutionMode = 'native' | 'token' | 'batch' | 'all';

interface ClaimExecutionContext {
  mode: ClaimExecutionMode;
  tokenOrTokens?: Address | Address[];
}

const mapTxStatusToClaimStatus = (status: TxStatus): ClaimRewardsStatus => {
  switch (status) {
    case TxStatus.PROCESSING:
      return 'pending';
    case TxStatus.COMPLETE:
      return 'success';
    case TxStatus.ERROR:
      return 'error';
    case TxStatus.NOT_YET_INITIATED:
    default:
      return 'idle';
  }
};

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
  const [fallbackError, setFallbackError] = useState<Error | null>(null);

  const chainId = useChainId();
  const queryClient = useQueryClient();
  const contracts = useMemo(() => getContracts(chainId), [chainId]);

  const invalidateRewardsQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['rewards', 'pending'] }),
      queryClient.invalidateQueries({ queryKey: ['rewards', 'tokens'] }),
      queryClient.invalidateQueries({ queryKey: ['rewards', 'claims'] }),
    ]);
  }, [queryClient]);

  const claimTx = useContractWrite(
    TANGLE_ABI,
    async (context: ClaimExecutionContext, _activeAddress) => {
      if (!contracts) {
        return null;
      }

      if (context.mode === 'token') {
        const token = context.tokenOrTokens as Address | undefined;
        if (!token) {
          throw new Error('Token address is required for token claim');
        }

        return {
          address: contracts.tangle,
          abi: TANGLE_ABI,
          functionName: 'claimRewards' as const,
          args: [token] as const,
        };
      }

      if (context.mode === 'batch') {
        const tokens = context.tokenOrTokens as Address[] | undefined;
        if (!tokens || tokens.length === 0) {
          throw new Error('At least one token is required for batch claim');
        }

        return {
          address: contracts.tangle,
          abi: TANGLE_ABI,
          functionName: 'claimRewardsBatch' as const,
          args: [tokens] as const,
        };
      }

      if (context.mode === 'all') {
        return {
          address: contracts.tangle,
          abi: TANGLE_ABI,
          functionName: 'claimRewardsAll' as const,
          args: [] as const,
        };
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'claimRewards' as const,
        args: [] as const,
      };
    },
    {
      txName: 'claim rewards',
      getSuccessMessage: (context) => {
        if (context.mode === 'token') {
          return 'Successfully claimed rewards for asset';
        }

        if (context.mode === 'batch') {
          const tokens = context.tokenOrTokens as Address[] | undefined;
          return `Successfully claimed rewards for ${tokens?.length ?? 0} asset(s)`;
        }

        if (context.mode === 'all') {
          return 'Successfully claimed all rewards';
        }

        return 'Successfully claimed rewards';
      },
      onSuccess: () => {
        void invalidateRewardsQueries();
      },
    },
  );

  const executeClaim = useCallback(
    async (
      mode: ClaimExecutionMode,
      tokenOrTokens?: Address | Address[],
    ): Promise<Hash | null> => {
      setFallbackError(null);

      if (!claimTx.execute) {
        setFallbackError(new Error('Wallet not connected'));
        return null;
      }

      try {
        const result = await claimTx.execute({
          mode,
          tokenOrTokens,
        });

        return result?.hash ?? null;
      } catch (error) {
        setFallbackError(
          error instanceof Error ? error : new Error('Failed to claim rewards'),
        );
        return null;
      }
    },
    [claimTx],
  );

  const reset = useCallback(() => {
    setFallbackError(null);
    claimTx.reset();
  }, [claimTx]);

  const claimNative = useCallback(() => {
    return executeClaim('native');
  }, [executeClaim]);

  const claimToken = useCallback(
    (token: Address) => {
      return executeClaim('token', token);
    },
    [executeClaim],
  );

  const claimBatch = useCallback(
    (tokens: Address[]) => {
      return executeClaim('batch', tokens);
    },
    [executeClaim],
  );

  const claimAllTokens = useCallback(() => {
    return executeClaim('all');
  }, [executeClaim]);

  const claimRewards = useCallback(
    async (token?: Address): Promise<Hash | null> => {
      if (token) {
        return claimToken(token);
      }

      return claimNative();
    },
    [claimNative, claimToken],
  );

  return {
    claimNative,
    claimToken,
    claimBatch,
    claimAllTokens,
    claimRewards,
    status:
      fallbackError !== null
        ? 'error'
        : mapTxStatusToClaimStatus(claimTx.status),
    error: fallbackError ?? claimTx.error,
    reset,
  };
};

/**
 * Format reward amount for display.
 */
export const formatRewardAmount = (amount: bigint, decimals = 18): string => {
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

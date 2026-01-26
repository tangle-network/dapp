/**
 * Hook to batch check if the current user can delegate to multiple operators.
 * Useful for sorting/filtering operator lists by delegation eligibility.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { DelegationMode } from './useCanDelegate';

export interface OperatorDelegationInfo {
  /** Whether the delegator can delegate to this operator */
  canDelegate: boolean;
  /** The operator's delegation mode */
  delegationMode: DelegationMode;
  /** Whether the delegator is whitelisted (only relevant for Whitelist mode) */
  isWhitelisted: boolean;
}

export interface UseCanDelegateToOperatorsOptions {
  /** List of operator addresses to check */
  operators: Address[];
  /** The delegator address (current user) */
  delegator: Address | undefined;
  /** Whether the query is enabled */
  enabled?: boolean;
}

export interface UseCanDelegateToOperatorsResult {
  /** Map of operator address to their delegation info */
  delegationInfo: Map<Address, OperatorDelegationInfo>;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Error from the query, if any */
  error: Error | null;
  /** Refetch the delegation info */
  refetch: () => void;
}

/**
 * Hook to batch check if a delegator can delegate to multiple operators.
 *
 * @example
 * ```tsx
 * const { delegationInfo, isLoading } = useCanDelegateToOperators({
 *   operators: operatorAddresses,
 *   delegator: userAddress,
 * });
 *
 * // Sort operators by eligibility
 * const sortedOperators = operators.sort((a, b) => {
 *   const aInfo = delegationInfo.get(a.address);
 *   const bInfo = delegationInfo.get(b.address);
 *   if (aInfo?.canDelegate && !bInfo?.canDelegate) return -1;
 *   if (!aInfo?.canDelegate && bInfo?.canDelegate) return 1;
 *   return 0;
 * });
 * ```
 */
export const useCanDelegateToOperators = ({
  operators,
  delegator,
  enabled = true,
}: UseCanDelegateToOperatorsOptions): UseCanDelegateToOperatorsResult => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  const query = useQuery({
    queryKey: [
      'canDelegateToOperators',
      chainId,
      delegator,
      operators.map((op) => op.toLowerCase()).sort(),
    ],
    queryFn: async () => {
      const map = new Map<Address, OperatorDelegationInfo>();

      if (!publicClient || operators.length === 0 || !delegator) {
        return map;
      }

      let contracts;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        return map;
      }

      const results = await Promise.allSettled(
        operators.map(async (operator) => {
          const [canDelegate, delegationMode, isWhitelisted] =
            await Promise.all([
              publicClient.readContract({
                address: contracts.multiAssetDelegation,
                abi: MULTI_ASSET_DELEGATION_ABI,
                functionName: 'canDelegate',
                args: [operator, delegator],
              }) as Promise<boolean>,
              publicClient.readContract({
                address: contracts.multiAssetDelegation,
                abi: MULTI_ASSET_DELEGATION_ABI,
                functionName: 'getDelegationMode',
                args: [operator],
              }) as Promise<number>,
              publicClient.readContract({
                address: contracts.multiAssetDelegation,
                abi: MULTI_ASSET_DELEGATION_ABI,
                functionName: 'isWhitelisted',
                args: [operator, delegator],
              }) as Promise<boolean>,
            ]);

          return {
            operator,
            info: {
              canDelegate,
              delegationMode: delegationMode as DelegationMode,
              isWhitelisted,
            },
          };
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          map.set(result.value.operator, result.value.info);
        }
      }

      return map;
    },
    enabled: enabled && !!publicClient && operators.length > 0 && !!delegator,
    staleTime: 30_000, // 30 seconds
    retry: 2,
  });

  return {
    delegationInfo: query.data ?? new Map(),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useCanDelegateToOperators;

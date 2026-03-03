/**
 * Hook to fetch delegation modes for multiple operators.
 * Useful for displaying delegation status in operator lists.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { DelegationMode } from './useCanDelegate';
import { CACHE_CONFIG } from '../../constants/cacheConfig';

export interface UseOperatorDelegationModesOptions {
  /** List of operator addresses to fetch delegation modes for */
  operators: Address[];
  /** Whether the query is enabled */
  enabled?: boolean;
}

export interface UseOperatorDelegationModesResult {
  /** Map of operator address to their delegation mode */
  delegationModes: Map<Address, DelegationMode>;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Error from the query, if any */
  error: Error | null;
  /** Refetch the delegation modes */
  refetch: () => void;
}

/**
 * Hook to fetch delegation modes for multiple operators in a batch.
 *
 * @example
 * ```tsx
 * const { delegationModes, isLoading } = useOperatorDelegationModes({
 *   operators: operatorAddresses,
 * });
 *
 * // Get mode for a specific operator
 * const mode = delegationModes.get(operatorAddress);
 * ```
 */
export const useOperatorDelegationModes = ({
  operators,
  enabled = true,
}: UseOperatorDelegationModesOptions): UseOperatorDelegationModesResult => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  const query = useQuery({
    queryKey: [
      'operatorDelegationModes',
      chainId,
      operators.map((op) => op.toLowerCase()).sort(),
    ],
    queryFn: async () => {
      const map = new Map<Address, DelegationMode>();

      if (!publicClient || operators.length === 0) {
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
          const mode = (await publicClient.readContract({
            address: contracts.multiAssetDelegation,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName: 'getDelegationMode',
            args: [operator],
          })) as number;

          return { operator, mode: mode as DelegationMode };
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          map.set(result.value.operator, result.value.mode);
        }
      }

      return map;
    },
    enabled: enabled && !!publicClient && operators.length > 0,
    staleTime: CACHE_CONFIG.DELEGATION.staleTime,
    retry: 2,
  });

  return {
    delegationModes: query.data ?? new Map(),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useOperatorDelegationModes;

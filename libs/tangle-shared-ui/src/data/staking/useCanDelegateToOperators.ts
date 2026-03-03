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
import { CACHE_CONFIG } from '../../constants/cacheConfig';

export interface OperatorDelegationInfo {
  canDelegate: boolean;
  delegationMode: DelegationMode;
  isWhitelisted: boolean;
}

export interface UseCanDelegateToOperatorsOptions {
  operators: Address[];
  delegator: Address | undefined;
  enabled?: boolean;
}

export interface UseCanDelegateToOperatorsResult {
  delegationInfo: Map<Address, OperatorDelegationInfo>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCanDelegateToOperators = ({
  operators,
  delegator,
  enabled = true,
}: UseCanDelegateToOperatorsOptions): UseCanDelegateToOperatorsResult => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  const query = useQuery({
    queryKey: [
      'stakingCanDelegateToOperators',
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
    staleTime: CACHE_CONFIG.DELEGATION.staleTime,
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

/**
 * Hook to check if a delegator can delegate to an operator.
 * Uses the delegation permission system from tnt-core.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { CACHE_CONFIG } from '../../constants/cacheConfig';

/**
 * Delegation mode enum matching the contract.
 * - Disabled (0): Only operator can self-stake (DEFAULT)
 * - Whitelist (1): Only approved addresses can delegate
 * - Open (2): Anyone can delegate
 */
export enum DelegationMode {
  Disabled = 0,
  Whitelist = 1,
  Open = 2,
}

export interface UseCanDelegateOptions {
  operator: Address | undefined;
  delegator: Address | undefined;
  enabled?: boolean;
}

export interface UseCanDelegateResult {
  canDelegate: boolean | undefined;
  delegationMode: DelegationMode | undefined;
  isWhitelisted: boolean | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCanDelegate = ({
  operator,
  delegator,
  enabled = true,
}: UseCanDelegateOptions): UseCanDelegateResult => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  const query = useQuery({
    queryKey: ['stakingCanDelegate', chainId, operator, delegator],
    queryFn: async () => {
      if (!publicClient || !operator || !delegator) {
        return null;
      }

      let contracts;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        return null;
      }

      const [canDelegate, delegationMode, isWhitelisted] = await Promise.all([
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
        canDelegate,
        delegationMode: delegationMode as DelegationMode,
        isWhitelisted,
      };
    },
    enabled: enabled && !!publicClient && !!operator && !!delegator,
    staleTime: CACHE_CONFIG.DELEGATION.staleTime,
    retry: 2,
  });

  return {
    canDelegate: query.data?.canDelegate,
    delegationMode: query.data?.delegationMode,
    isWhitelisted: query.data?.isWhitelisted,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useCanDelegate;

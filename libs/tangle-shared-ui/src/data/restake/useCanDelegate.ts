/**
 * Hook to check if a delegator can delegate to an operator.
 * Uses the new delegation permission system from tnt-core.
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
  /** Whether the delegator can delegate to the operator */
  canDelegate: boolean | undefined;
  /** The operator's current delegation mode */
  delegationMode: DelegationMode | undefined;
  /** Whether the delegator is whitelisted (only relevant for Whitelist mode) */
  isWhitelisted: boolean | undefined;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Error from the query, if any */
  error: Error | null;
  /** Refetch the delegation status */
  refetch: () => void;
}

/**
 * Hook to check if a delegator can delegate to an operator.
 *
 * @example
 * ```tsx
 * const { canDelegate, delegationMode, isLoading } = useCanDelegate({
 *   operator: selectedOperatorAddress,
 *   delegator: userAddress,
 * });
 *
 * // In JSX:
 * <Button isDisabled={!canDelegate || isLoading}>
 *   {!canDelegate
 *     ? delegationMode === DelegationMode.Disabled
 *       ? 'Operator Not Accepting Delegations'
 *       : 'Not Whitelisted'
 *     : 'Delegate'}
 * </Button>
 * ```
 */
export const useCanDelegate = ({
  operator,
  delegator,
  enabled = true,
}: UseCanDelegateOptions): UseCanDelegateResult => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  const query = useQuery({
    queryKey: ['canDelegate', chainId, operator, delegator],
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

      // Fetch all delegation info in parallel
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

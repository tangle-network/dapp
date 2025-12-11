/**
 * Hook for claiming delegator rewards from the MultiAssetDelegation contract.
 */

import { useChainId } from 'wagmi';
import useContractWrite from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import MULTI_ASSET_DELEGATION_ABI from '@tangle-network/tangle-shared-ui/abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';

/**
 * Hook to claim delegator rewards from MultiAssetDelegation.
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useClaimDelegatorRewardsTx();
 *
 * // Claim all pending rewards
 * await execute({});
 * ```
 */
export const useClaimDelegatorRewardsTx = () => {
  const chainId = useChainId();

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    contracts = null;
  }

  return useContractWrite(
    MULTI_ASSET_DELEGATION_ABI,
    (_params: Record<string, never>, _activeAddress) => {
      if (!contracts) {
        return null;
      }

      return {
        address: contracts.multiAssetDelegation,
        abi: MULTI_ASSET_DELEGATION_ABI,
        functionName: 'claimDelegatorRewards' as const,
        args: [] as const,
      };
    },
    {
      getSuccessMessage: () => `Successfully claimed delegator rewards`,
    },
  );
};

export default useClaimDelegatorRewardsTx;

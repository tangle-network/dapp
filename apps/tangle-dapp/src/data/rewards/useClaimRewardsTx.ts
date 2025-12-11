/**
 * Hook for claiming delegator rewards from the RewardVaults contract.
 * Supports batch claiming from multiple operators for a single asset.
 */

import { Address } from 'viem';
import { useChainId } from 'wagmi';
import useContractWrite from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import REWARD_VAULTS_ABI from '@tangle-network/tangle-shared-ui/abi/rewardVaults';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';

export interface ClaimRewardsParams {
  asset: Address;
  operators: Address[];
}

/**
 * Hook to claim delegator rewards from RewardVaults.
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useClaimRewardsTx();
 *
 * // Claim rewards from multiple operators for an asset
 * await execute({
 *   asset: '0x...',
 *   operators: ['0x...', '0x...'],
 * });
 * ```
 */
export const useClaimRewardsTx = () => {
  const chainId = useChainId();

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    contracts = null;
  }

  return useContractWrite(
    REWARD_VAULTS_ABI,
    (params: ClaimRewardsParams, _activeAddress) => {
      if (!contracts) {
        return null;
      }

      return {
        address: contracts.rewardVaults,
        abi: REWARD_VAULTS_ABI,
        functionName: 'claimDelegatorRewardsBatch' as const,
        args: [params.asset, params.operators] as const,
      };
    },
    {
      getSuccessMessage: (_params) => `Successfully claimed rewards`,
    },
  );
};

export default useClaimRewardsTx;

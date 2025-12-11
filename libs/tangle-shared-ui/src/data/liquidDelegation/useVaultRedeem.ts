/**
 * Hook for claiming redeemed assets from a LiquidDelegationVault.
 * This completes the async redemption process after the delay period.
 */

import { Address } from 'viem';
import useContractWrite from '../../hooks/useContractWrite';
import LIQUID_DELEGATION_VAULT_ABI from '../../abi/liquidDelegationVault';

export interface VaultRedeemParams {
  vaultAddress: Address;
  shares: bigint;
  receiver: Address;
  controller: Address;
}

/**
 * Hook to claim redeemed assets from a LiquidDelegationVault.
 * Can only be called after the delay period from requestRedeem.
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useVaultRedeem();
 *
 * // Claim redeemed assets
 * await execute({
 *   vaultAddress: '0x...',
 *   shares: parseUnits('50', 18),
 *   receiver: userAddress,
 *   controller: userAddress,
 * });
 * ```
 */
export const useVaultRedeem = () => {
  return useContractWrite(
    LIQUID_DELEGATION_VAULT_ABI,
    (params: VaultRedeemParams, _activeAddress) => ({
      address: params.vaultAddress,
      abi: LIQUID_DELEGATION_VAULT_ABI,
      functionName: 'redeem' as const,
      args: [params.shares, params.receiver, params.controller] as const,
    }),
    {
      getSuccessMessage: (_params) => `Successfully redeemed assets from vault`,
    },
  );
};

export default useVaultRedeem;

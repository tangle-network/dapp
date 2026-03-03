/**
 * Hook for requesting redemption from a LiquidDelegationVault.
 * This initiates the async redemption process per ERC7540.
 */

import { Address } from 'viem';
import useContractWrite from '../../hooks/useContractWrite';
import LIQUID_DELEGATION_VAULT_ABI from '../../abi/liquidDelegationVault';

export interface VaultRequestRedeemParams {
  vaultAddress: Address;
  /** The underlying asset token address for display in tx history */
  asset: Address;
  shares: bigint;
  controller: Address;
  owner: Address;
}

/**
 * Hook to request redemption from a LiquidDelegationVault.
 * Burns shares immediately and schedules unstake in the underlying staking contract.
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useVaultRequestRedeem();
 *
 * // Request redemption of 50 shares
 * await execute({
 *   vaultAddress: '0x...',
 *   shares: parseUnits('50', 18),
 *   controller: userAddress,
 *   owner: userAddress,
 * });
 * ```
 */
export const useVaultRequestRedeem = () => {
  return useContractWrite(
    LIQUID_DELEGATION_VAULT_ABI,
    (params: VaultRequestRedeemParams, _activeAddress) => ({
      address: params.vaultAddress,
      abi: LIQUID_DELEGATION_VAULT_ABI,
      functionName: 'requestRedeem' as const,
      args: [params.shares, params.controller, params.owner] as const,
    }),
    {
      txName: 'liquid stake request redeem',
      txDetails: (params) =>
        new Map([
          ['Token', params.asset],
          ['Shares', params.shares.toString()],
        ]),
      getSuccessMessage: (_params) =>
        `Successfully requested redemption from vault`,
    },
  );
};

export default useVaultRequestRedeem;

/**
 * Hook for depositing assets into a LiquidDelegationVault.
 * Deposits assets and receives liquid delegation tokens (ldTokens).
 */

import { Address } from 'viem';
import useContractWrite from '../../hooks/useContractWrite';
import LIQUID_DELEGATION_VAULT_ABI from '../../abi/liquidDelegationVault';

export interface VaultDepositParams {
  vaultAddress: Address;
  /** The underlying asset token address for proper symbol display in tx history */
  asset: Address;
  amount: bigint;
  receiver: Address;
}

/**
 * Hook to deposit assets into a LiquidDelegationVault.
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useVaultDeposit();
 *
 * // Deposit 100 tokens into vault
 * await execute({
 *   vaultAddress: '0x...',
 *   amount: parseUnits('100', 18),
 *   receiver: userAddress,
 * });
 * ```
 */
export const useVaultDeposit = () => {
  return useContractWrite(
    LIQUID_DELEGATION_VAULT_ABI,
    (params: VaultDepositParams, _activeAddress) => ({
      address: params.vaultAddress,
      abi: LIQUID_DELEGATION_VAULT_ABI,
      functionName: 'deposit' as const,
      args: [params.amount, params.receiver] as const,
    }),
    {
      txName: 'liquid stake deposit',
      txDetails: (params) =>
        new Map([
          ['Token', params.asset],
          ['Amount', params.amount.toString()],
        ]),
      getSuccessMessage: (_params) =>
        `Successfully deposited into liquid delegation vault`,
    },
  );
};

export default useVaultDeposit;

/**
 * Hook for depositing assets into the MultiAssetDelegation contract.
 * Replaces the Substrate-based useRestakeDepositTx hook.
 */

import { Address, zeroAddress } from 'viem';
import useContractWrite from '../../hooks/useContractWrite';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';
import { LockDuration } from '../graphql/useDelegator';

// Lock multiplier enum values (matching contract's Types.LockMultiplier)
// Maps our LockDuration type to the contract's LockMultiplier enum
const LOCK_MULTIPLIER_VALUES: Record<LockDuration, number> = {
  NONE: 0,
  ONE_MONTH: 1,
  TWO_MONTHS: 2,
  THREE_MONTHS: 3,
  SIX_MONTHS: 4,
};

export interface DepositParams {
  token: Address;
  amount: bigint;
  lockDuration?: LockDuration;
}

/**
 * Hook to deposit assets into the MultiAssetDelegation contract.
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useDepositTx();
 *
 * // Deposit 100 tokens with no lock
 * await execute({
 *   token: '0x...',
 *   amount: parseUnits('100', 18),
 * });
 *
 * // Deposit with 3-month lock
 * await execute({
 *   token: '0x...',
 *   amount: parseUnits('100', 18),
 *   lockDuration: 'THREE_MONTHS',
 * });
 * ```
 */
export const useDepositTx = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  return useContractWrite(
    MULTI_ASSET_DELEGATION_ABI,
    (params: DepositParams, _activeAddress) => {
      const lockMultiplier = LOCK_MULTIPLIER_VALUES[params.lockDuration ?? 'NONE'];

      // Native deposits are payable and do not take a token/amount argument.
      if (params.token.toLowerCase() === zeroAddress) {
        return {
          address: contracts.multiAssetDelegation,
          abi: MULTI_ASSET_DELEGATION_ABI,
          functionName: 'depositWithLock' as const,
          args: [lockMultiplier] as const,
          value: params.amount,
        };
      }

      return {
        address: contracts.multiAssetDelegation,
        abi: MULTI_ASSET_DELEGATION_ABI,
        functionName: 'depositERC20WithLock' as const,
        args: [params.token, params.amount, lockMultiplier] as const,
      };
    },
    {
      getSuccessMessage: (params) =>
        `Successfully deposited ${params.amount.toString()}`,
    },
  );
};

export default useDepositTx;

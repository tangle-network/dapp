/**
 * Hooks for withdrawing assets from the MultiAssetDelegation contract.
 * Replaces the Substrate-based useRestakeWithdrawTx hook.
 */

import { Address } from 'viem';
import useContractWrite from '../../hooks/useContractWrite';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';

export interface ScheduleWithdrawParams {
  token: Address;
  amount: bigint;
}

/**
 * Hook to schedule a withdrawal of deposited assets.
 * This initiates the withdrawal process - assets will be available
 * after the withdrawal delay (in rounds).
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useScheduleWithdrawTx();
 *
 * await execute({
 *   token: '0x...',
 *   amount: parseUnits('100', 18),
 * });
 * ```
 */
export const useScheduleWithdrawTx = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  return useContractWrite(
    MULTI_ASSET_DELEGATION_ABI,
    (params: ScheduleWithdrawParams, _activeAddress) => ({
      address: contracts.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'scheduleWithdraw',
      args: [params.token, params.amount],
    }),
    {
      getSuccessMessage: () => 'Successfully scheduled withdrawal',
    },
  );
};

/**
 * Hook to execute a scheduled withdrawal after the delay period.
 * Call this after the readyAtRound has been reached.
 */
export const useExecuteWithdrawTx = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  return useContractWrite(
    MULTI_ASSET_DELEGATION_ABI,
    (_params: void, _activeAddress) => ({
      address: contracts.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'executeWithdraw',
      args: [],
    }),
    {
      getSuccessMessage: () => 'Successfully executed withdrawal',
    },
  );
};

export default useScheduleWithdrawTx;

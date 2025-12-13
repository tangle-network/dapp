/**
 * Hooks for undelegating (scheduling unstake) from an operator.
 * Replaces the Substrate-based useRestakeUndelegateTx hook.
 */

import { Address } from 'viem';
import useContractWrite from '../../hooks/useContractWrite';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';

export interface ScheduleUnstakeParams {
  operator: Address;
  token: Address;
  amount: bigint;
}

/**
 * Hook to schedule unstaking shares from an operator.
 * This initiates the unstaking process - shares will be available
 * for withdrawal after the unstaking delay (in rounds).
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useScheduleUnstakeTx();
 *
 * await execute({
 *   operator: '0x...',
 *   token: '0x...',
 *   shares: parseUnits('100', 18),
 * });
 * ```
 */
export const useScheduleUnstakeTx = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  return useContractWrite(
    MULTI_ASSET_DELEGATION_ABI,
    (params: ScheduleUnstakeParams, _activeAddress) => ({
      address: contracts.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'scheduleDelegatorUnstake' as const,
      args: [params.operator, params.token, params.amount] as const,
    }),
    {
      getSuccessMessage: () => 'Successfully scheduled unstake',
    },
  );
};

/**
 * Hook to execute a scheduled unstake after the delay period.
 * Call this after the readyAtRound has been reached.
 */
export const useExecuteUnstakeTx = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  return useContractWrite(
    MULTI_ASSET_DELEGATION_ABI,
    (_params: void, _activeAddress) => ({
      address: contracts.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'executeDelegatorUnstake' as const,
      args: [] as const,
    }),
    {
      getSuccessMessage: () => 'Successfully executed unstake',
    },
  );
};

export default useScheduleUnstakeTx;

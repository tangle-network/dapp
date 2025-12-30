/**
 * Hooks for undelegating from an operator.
 * Replaces the Substrate-based useRestakeUndelegateTx hook.
 */

import { Address } from 'viem';
import useContractWrite from '../../hooks/useContractWrite';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';

export interface ScheduleUndelegateParams {
  operator: Address;
  token: Address;
  amount: bigint;
}

/**
 * Hook to schedule undelegation from an operator.
 * This initiates the undelegation process - shares will be available
 * for withdrawal after the undelegation delay (in rounds).
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useScheduleUndelegateTx();
 *
 * await execute({
 *   operator: '0x...',
 *   token: '0x...',
 *   shares: parseUnits('100', 18),
 * });
 * ```
 */
export const useScheduleUndelegateTx = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  return useContractWrite(
    MULTI_ASSET_DELEGATION_ABI,
    (params: ScheduleUndelegateParams, _activeAddress) => ({
      address: contracts.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'scheduleDelegatorUnstake' as const,
      args: [params.operator, params.token, params.amount] as const,
    }),
    {
      txName: 'restake undelegate',
      txDetails: (params) =>
        new Map([
          ['Operator', params.operator],
          ['Token', params.token],
          ['Amount', params.amount.toString()],
        ]),
      getSuccessMessage: () => 'Successfully scheduled undelegate',
    },
  );
};

/**
 * Hook to execute a scheduled undelegate after the delay period.
 * Call this after the readyAtRound has been reached.
 */
export const useExecuteUndelegateTx = () => {
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
      txName: 'restake execute undelegate',
      getSuccessMessage: () => 'Successfully executed undelegate',
    },
  );
};

export default useScheduleUndelegateTx;

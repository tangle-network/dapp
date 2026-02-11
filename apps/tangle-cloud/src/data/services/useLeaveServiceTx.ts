/**
 * EVM hook for leaving a service directly via the Tangle contract.
 * This is used when exitQueueDuration is 0 (no exit queue required).
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';

export { TxStatus };

export interface LeaveServiceParams {
  serviceId: bigint;
}

export interface UseLeaveServiceTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useLeaveServiceTx = (options?: UseLeaveServiceTxOptions) => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: LeaveServiceParams, _activeAddress) => ({
      address: contracts.tangle,
      abi: TANGLE_ABI,
      functionName: 'leaveService' as const,
      args: [params.serviceId] as const,
    }),
    {
      txName: 'leave service',
      txDetails: (params) =>
        new Map([['Service ID', params.serviceId.toString()]]),
      getSuccessMessage: (params) =>
        `Successfully left service #${params.serviceId}`,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['serviceOperators'] });
        queryClient.invalidateQueries({ queryKey: ['serviceDetails'] });
        queryClient.invalidateQueries({ queryKey: ['exitStatus'] });
        options?.onSuccess?.();
      },
      onError: options?.onError,
    },
  );

  return {
    execute: hook.execute,
    status: hook.status,
    error: hook.error,
    reset: hook.reset,
    txHash: hook.txHash,
    isSuccess: hook.isSuccess,
    isPending: hook.isLoading,
  };
};

export default useLeaveServiceTx;

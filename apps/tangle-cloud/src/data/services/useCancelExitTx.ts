/**
 * EVM hook for canceling a scheduled exit from a service via the Tangle contract.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { useChainId } from 'wagmi';
import getContractsForChain from './getContractsForChain';

export { TxStatus };

export interface CancelExitParams {
  serviceId: bigint;
}

export interface UseCancelExitTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCancelExitTx = (options?: UseCancelExitTxOptions) => {
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: CancelExitParams, _activeAddress) => {
      if (!contracts) {
        return null;
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'cancelExit' as const,
        args: [params.serviceId] as const,
      };
    },
    {
      txName: 'cancel exit',
      txDetails: (params) =>
        new Map([['Service ID', params.serviceId.toString()]]),
      getSuccessMessage: (params) =>
        `Successfully canceled exit from service #${params.serviceId}`,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['exitStatus'] });
        queryClient.invalidateQueries({ queryKey: ['exitRequest'] });
        queryClient.invalidateQueries({ queryKey: ['canScheduleExit'] });
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

export default useCancelExitTx;

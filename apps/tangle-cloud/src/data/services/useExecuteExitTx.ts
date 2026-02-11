/**
 * EVM hook for executing a scheduled exit from a service via the Tangle contract.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';

export { TxStatus };

export interface ExecuteExitParams {
  serviceId: bigint;
}

export interface UseExecuteExitTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useExecuteExitTx = (options?: UseExecuteExitTxOptions) => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: ExecuteExitParams, _activeAddress) => ({
      address: contracts.tangle,
      abi: TANGLE_ABI,
      functionName: 'executeExit' as const,
      args: [params.serviceId] as const,
    }),
    {
      txName: 'execute exit',
      txDetails: (params) =>
        new Map([['Service ID', params.serviceId.toString()]]),
      getSuccessMessage: (params) =>
        `Successfully exited service #${params.serviceId}`,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['exitStatus'] });
        queryClient.invalidateQueries({ queryKey: ['exitRequest'] });
        queryClient.invalidateQueries({ queryKey: ['serviceOperators'] });
        queryClient.invalidateQueries({ queryKey: ['serviceDetails'] });
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

export default useExecuteExitTx;

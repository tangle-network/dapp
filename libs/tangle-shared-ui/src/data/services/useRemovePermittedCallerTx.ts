/**
 * Hook for removing a permitted caller from a service via the Tangle contract.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, {
  TxStatus,
} from '../../hooks/useContractWrite';
import TangleABI from '../../abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';
import { Address } from 'viem';

export { TxStatus };

export interface RemovePermittedCallerParams {
  serviceId: bigint;
  caller: Address;
}

export interface UseRemovePermittedCallerTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useRemovePermittedCallerTx = (
  options?: UseRemovePermittedCallerTxOptions,
) => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TangleABI,
    (params: RemovePermittedCallerParams, _activeAddress) => ({
      address: contracts.tangle,
      abi: TangleABI,
      functionName: 'removePermittedCaller' as const,
      args: [params.serviceId, params.caller] as const,
    }),
    {
      txName: 'remove permitted caller',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Service ID', params.serviceId.toString());
        details.set('Caller', params.caller);
        return details;
      },
      getSuccessMessage: (params) =>
        `Successfully removed ${params.caller.slice(0, 10)}... as permitted caller from service #${params.serviceId}`,
      onSuccess: (_result, params) => {
        queryClient.invalidateQueries({
          queryKey: ['isPermittedCaller', chainId, params.serviceId.toString()],
        });
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

export default useRemovePermittedCallerTx;

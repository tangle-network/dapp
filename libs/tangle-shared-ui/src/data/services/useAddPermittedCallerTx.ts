/**
 * Hook for adding a permitted caller to a service via the Tangle contract.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, { TxStatus } from '../../hooks/useContractWrite';
import TangleABI from '../../abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';
import { Address } from 'viem';

export { TxStatus };

export interface AddPermittedCallerParams {
  serviceId: bigint;
  caller: Address;
}

export interface UseAddPermittedCallerTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAddPermittedCallerTx = (
  options?: UseAddPermittedCallerTxOptions,
) => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TangleABI,
    (params: AddPermittedCallerParams, _activeAddress) => ({
      address: contracts.tangle,
      abi: TangleABI,
      functionName: 'addPermittedCaller' as const,
      args: [params.serviceId, params.caller] as const,
    }),
    {
      txName: 'add permitted caller',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Service ID', params.serviceId.toString());
        details.set('Caller', params.caller);
        return details;
      },
      getSuccessMessage: (params) =>
        `Successfully added ${params.caller.slice(0, 10)}... as permitted caller for service #${params.serviceId}`,
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

export default useAddPermittedCallerTx;

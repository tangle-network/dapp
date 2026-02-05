/**
 * EVM hook for terminating a service via the Tangle contract.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';

export { TxStatus };

export interface ServiceTerminateParams {
  serviceId: bigint;
}

export interface UseServiceTerminateTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useServiceTerminateTx = (
  options?: UseServiceTerminateTxOptions,
) => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: ServiceTerminateParams, _activeAddress) => ({
      address: contracts.tangle,
      abi: TANGLE_ABI,
      functionName: 'terminateService' as const,
      args: [params.serviceId] as const,
    }),
    {
      txName: 'terminate service',
      txDetails: (params) =>
        new Map([['Service ID', params.serviceId.toString()]]),
      getSuccessMessage: (params) =>
        `Successfully terminated service #${params.serviceId}`,
      onSuccess: () => {
        // Invalidate service-related queries to refresh UI immediately
        queryClient.invalidateQueries({ queryKey: ['serviceDetails'] });
        queryClient.invalidateQueries({ queryKey: ['serviceEscrow'] });
        queryClient.invalidateQueries({ queryKey: ['services'] });
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

export default useServiceTerminateTx;

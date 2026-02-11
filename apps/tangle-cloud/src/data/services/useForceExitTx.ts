/**
 * EVM hook for force-exiting an operator from a service via the Tangle contract.
 * Only the service owner can use this when forceExitAllowed is true.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';
import { Address } from 'viem';

export { TxStatus };

export interface ForceExitParams {
  serviceId: bigint;
  operator: Address;
}

export interface UseForceExitTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useForceExitTx = (options?: UseForceExitTxOptions) => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: ForceExitParams, _activeAddress) => ({
      address: contracts.tangle,
      abi: TANGLE_ABI,
      functionName: 'forceExit' as const,
      args: [params.serviceId, params.operator] as const,
    }),
    {
      txName: 'force exit operator',
      txDetails: (params) =>
        new Map([
          ['Service ID', params.serviceId.toString()],
          ['Operator', params.operator],
        ]),
      getSuccessMessage: (params) =>
        `Successfully force-exited operator from service #${params.serviceId}`,
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

export default useForceExitTx;

/**
 * EVM hook for joining a service as an operator via the Tangle contract.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { useChainId } from 'wagmi';
import getContractsForChain from './getContractsForChain';

export { TxStatus };

export interface JoinServiceParams {
  serviceId: bigint;
  exposureBps: number;
}

export interface UseJoinServiceTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useJoinServiceTx = (options?: UseJoinServiceTxOptions) => {
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: JoinServiceParams, _activeAddress) => {
      if (!contracts) {
        return null;
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'joinService' as const,
        args: [params.serviceId, params.exposureBps] as const,
      };
    },
    {
      txName: 'join service',
      txDetails: (params) =>
        new Map([
          ['Service ID', params.serviceId.toString()],
          ['Exposure', `${(params.exposureBps / 100).toFixed(2)}%`],
        ]),
      getSuccessMessage: (params) =>
        `Successfully joined service #${params.serviceId}`,
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

export default useJoinServiceTx;

/**
 * EVM hook for rejecting a service request via the Tangle contract.
 */

import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { useChainId } from 'wagmi';
import getContractsForChain from './getContractsForChain';

export { TxStatus };

export interface ServiceRejectParams {
  requestId: bigint;
}

/**
 * Options for the useServiceRejectTx hook
 */
export interface UseServiceRejectTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for rejecting a service request.
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useServiceRejectTx();
 *
 * await execute({
 *   requestId: 1n,
 * });
 * ```
 */
export const useServiceRejectTx = (options?: UseServiceRejectTxOptions) => {
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: ServiceRejectParams, _activeAddress) => {
      if (!contracts) {
        return null;
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'rejectService' as const,
        args: [params.requestId] as const,
      };
    },
    {
      txName: 'reject service',
      txDetails: (params) =>
        new Map([['Request ID', params.requestId.toString()]]),
      getSuccessMessage: (params) =>
        `Successfully rejected service request #${params.requestId}`,
      onSuccess: options?.onSuccess,
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

export default useServiceRejectTx;

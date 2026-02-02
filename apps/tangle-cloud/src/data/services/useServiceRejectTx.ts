/**
 * EVM hook for rejecting a service request via the Tangle contract.
 */

import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';

export { TxStatus };

export interface ServiceRejectParams {
  requestId: bigint;
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
export const useServiceRejectTx = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: ServiceRejectParams, _activeAddress) => ({
      address: contracts.tangle,
      abi: TANGLE_ABI,
      functionName: 'rejectService' as const,
      args: [params.requestId] as const,
    }),
    {
      txName: 'reject service',
      txDetails: (params) =>
        new Map([['Request ID', params.requestId.toString()]]),
      getSuccessMessage: (params) =>
        `Successfully rejected service request #${params.requestId}`,
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

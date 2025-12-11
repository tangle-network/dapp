/**
 * EVM hook for terminating a service via the Tangle contract.
 * @deprecated TODO: Implement using proper Tangle contract ABI
 */

import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

export interface ServiceTerminateParams {
  serviceId: bigint;
}

/**
 * Hook for terminating a service.
 */
export const useServiceTerminateTx = () => {
  const execute = async (_params: ServiceTerminateParams): Promise<null> => {
    console.warn(
      'useServiceTerminateTx is not yet implemented for EVM Tangle contract',
    );
    return null;
  };

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
    error: null,
    reset: () => {
      // No-op: stub implementation
    },
    txHash: null,
    isSuccess: false,
    isPending: false,
  };
};

export default useServiceTerminateTx;

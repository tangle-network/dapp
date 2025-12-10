/**
 * EVM hook for rejecting a service request via the Tangle contract.
 * @deprecated TODO: Implement using proper Tangle contract ABI
 */

import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

export interface ServiceRejectParams {
  requestId: bigint;
}

/**
 * Hook for rejecting a service request.
 */
export const useServiceRejectTx = () => {
  const execute = async (_params: ServiceRejectParams): Promise<null> => {
    console.warn(
      'useServiceRejectTx is not yet implemented for EVM Tangle contract',
    );
    return null;
  };

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
    error: null,
    reset: () => {},
    txHash: null,
    isSuccess: false,
    isPending: false,
  };
};

export default useServiceRejectTx;

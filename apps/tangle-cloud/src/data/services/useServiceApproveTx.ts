/**
 * EVM hook for approving a service request via the Tangle contract.
 * @deprecated TODO: Implement using proper Tangle contract ABI
 */

import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

export interface ServiceApproveParams {
  requestId: bigint;
  restakingPercent: number;
}

/**
 * Hook for approving a service request.
 */
export const useServiceApproveTx = () => {
  const execute = async (_params: ServiceApproveParams): Promise<null> => {
    console.warn(
      'useServiceApproveTx is not yet implemented for EVM Tangle contract',
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

export default useServiceApproveTx;

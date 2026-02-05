/**
 * Hook for billing a subscription service via the Tangle contract.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, {
  TxStatus,
} from '../../hooks/useContractWrite';
import TangleABI from '../../abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';

export { TxStatus };

export interface BillSubscriptionParams {
  serviceId: bigint;
}

export interface UseBillSubscriptionTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useBillSubscriptionTx = (
  options?: UseBillSubscriptionTxOptions,
) => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TangleABI,
    (params: BillSubscriptionParams, _activeAddress) => ({
      address: contracts.tangle,
      abi: TangleABI,
      functionName: 'billSubscription' as const,
      args: [params.serviceId] as const,
    }),
    {
      txName: 'bill subscription',
      txDetails: (params) =>
        new Map([['Service ID', params.serviceId.toString()]]),
      getSuccessMessage: (params) =>
        `Successfully billed subscription for service #${params.serviceId}`,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['serviceEscrow'] });
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

export default useBillSubscriptionTx;

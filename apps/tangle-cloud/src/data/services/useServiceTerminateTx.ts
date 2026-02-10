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
import type { Service } from '@tangle-network/tangle-shared-ui/data/graphql';

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
      onSuccess: (_result, params) => {
        const removeFromActiveServiceQueries = () => {
          let serviceStillAppearsAsActive = false;
          const serviceQueries = queryClient
            .getQueryCache()
            .findAll({ queryKey: ['envio', 'services'] });

          for (const query of serviceQueries) {
            const key = query.queryKey as unknown[];
            const status = key[4];
            if (status !== 'ACTIVE') continue;

            queryClient.setQueryData(key, (old) => {
              if (!Array.isArray(old)) return old;

              const services = old as Service[];
              const containsTerminatedService = services.some(
                (service) => service.serviceId === params.serviceId,
              );

              if (!containsTerminatedService) return old;

              serviceStillAppearsAsActive = true;
              return services.filter(
                (service) => service.serviceId !== params.serviceId,
              );
            });
          }

          return serviceStillAppearsAsActive;
        };

        // Optimistically remove the service from any ACTIVE service lists so the
        // Running Instances table updates immediately, even before Envio indexes
        // the termination event.
        removeFromActiveServiceQueries();

        // On-chain queries: safe to invalidate immediately.
        queryClient.invalidateQueries({ queryKey: ['serviceDetails'] });
        queryClient.invalidateQueries({ queryKey: ['serviceEscrow'] });

        // Envio queries: refetch with a short backoff so we don't immediately
        // re-introduce stale indexer results, but still converge once indexed.
        queryClient.invalidateQueries({
          queryKey: ['envio', 'services'],
          refetchType: 'none',
        });
        queryClient.invalidateQueries({
          queryKey: ['envio', 'operatorStats'],
          refetchType: 'none',
        });

        let keepOptimisticRemoval = true;

        const refetchEnvio = async () => {
          await queryClient.refetchQueries({ queryKey: ['envio', 'services'] });

          if (keepOptimisticRemoval) {
            const serviceStillAppearsAsActive =
              removeFromActiveServiceQueries();
            if (!serviceStillAppearsAsActive) {
              keepOptimisticRemoval = false;
            }
          }

          void queryClient.refetchQueries({
            queryKey: ['envio', 'operatorStats'],
          });
        };

        [2_000, 5_000, 10_000, 20_000].forEach((delayMs) => {
          setTimeout(() => {
            void refetchEnvio();
          }, delayMs);
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

export default useServiceTerminateTx;

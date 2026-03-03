/**
 * EVM hook for terminating a service via the Tangle contract.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { useChainId } from 'wagmi';
import type { Service } from '@tangle-network/tangle-shared-ui/data/graphql';
import getContractsForChain from './getContractsForChain';

export { TxStatus };

export interface ServiceTerminateParams {
  serviceId: bigint;
}

export interface UseServiceTerminateTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Backoff windows for Envio reconciliation after terminateService.
const ENVIO_REFETCH_BACKOFF_MS = [2_000, 5_000, 10_000, 20_000] as const;

export const useServiceTerminateTx = (
  options?: UseServiceTerminateTxOptions,
) => {
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: ServiceTerminateParams, _activeAddress) => {
      if (!contracts) {
        return null;
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'terminateService' as const,
        args: [params.serviceId] as const,
      };
    },
    {
      txName: 'terminate service',
      txDetails: (params) =>
        new Map([['Service ID', params.serviceId.toString()]]),
      getSuccessMessage: (params) =>
        `Successfully terminated service #${params.serviceId}`,
      onSuccess: (_result, params) => {
        const removeFromActiveServiceQueries = () => {
          let serviceStillAppearsAsActive = false;
          const activeServiceKeys = queryClient
            .getQueryCache()
            .findAll({ queryKey: ['envio', 'services'] })
            .map((query) => query.queryKey as unknown[])
            .filter((key) => key[4] === 'ACTIVE');

          for (const key of activeServiceKeys) {
            const data = queryClient.getQueryData(key);
            if (!Array.isArray(data)) {
              continue;
            }

            const services = data as Service[];
            const containsTerminatedService = services.some(
              (service) => service.serviceId === params.serviceId,
            );
            if (!containsTerminatedService) {
              continue;
            }

            serviceStillAppearsAsActive = true;
            queryClient.setQueryData(
              key,
              services.filter((service) => service.serviceId !== params.serviceId),
            );
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

        ENVIO_REFETCH_BACKOFF_MS.forEach((delayMs) => {
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

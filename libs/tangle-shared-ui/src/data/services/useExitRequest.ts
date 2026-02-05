/**
 * Hook for fetching exit request details for an operator in a service.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';

export interface ExitRequest {
  serviceId: bigint;
  scheduledAt: bigint;
  executeAfter: bigint;
  pending: boolean;
}

export interface UseExitRequestOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch the exit request details for an operator in a service.
 *
 * @param serviceId - The service ID
 * @param operator - The operator address
 * @param options - Configuration options
 */
export const useExitRequest = (
  serviceId: bigint | undefined,
  operator: Address | undefined,
  options?: UseExitRequestOptions,
) => {
  const { enabled = true } = options ?? {};
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = chainId ? getContractsByChainId(chainId) : null;
  } catch {
    contracts = null;
  }

  return useQuery({
    queryKey: ['exitRequest', chainId, serviceId?.toString(), operator],
    queryFn: async (): Promise<ExitRequest | null> => {
      if (
        !publicClient ||
        !contracts ||
        serviceId === undefined ||
        !operator
      ) {
        return null;
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return null;
      }

      const result = await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'getExitRequest',
        args: [serviceId, operator],
      });

      const request = result as {
        serviceId: bigint;
        scheduledAt: bigint;
        executeAfter: bigint;
        pending: boolean;
      };

      return {
        serviceId: request.serviceId,
        scheduledAt: request.scheduledAt,
        executeAfter: request.executeAfter,
        pending: request.pending,
      };
    },
    enabled:
      enabled &&
      !!publicClient &&
      !!contracts &&
      contracts.tangle !== zeroAddress &&
      serviceId !== undefined &&
      !!operator,
    staleTime: 10_000,
    retry: 2,
  });
};

export default useExitRequest;

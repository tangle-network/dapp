/**
 * Hook for fetching the list of operators for a service.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';

export interface UseServiceOperatorsOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch the list of operator addresses for a service.
 *
 * @param serviceId - The service ID
 * @param options - Configuration options
 */
export const useServiceOperators = (
  serviceId: bigint | undefined,
  options?: UseServiceOperatorsOptions,
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
    queryKey: ['serviceOperators', chainId, serviceId?.toString()],
    queryFn: async (): Promise<Address[]> => {
      if (!publicClient || !contracts || serviceId === undefined) {
        return [];
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return [];
      }

      const result = await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'getServiceOperators',
        args: [serviceId],
      });

      return result as Address[];
    },
    enabled:
      enabled &&
      !!publicClient &&
      !!contracts &&
      contracts.tangle !== zeroAddress &&
      serviceId !== undefined,
    staleTime: 30_000,
    retry: 2,
  });
};

export default useServiceOperators;

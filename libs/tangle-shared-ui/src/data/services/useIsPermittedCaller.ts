/**
 * Hook for checking if an address is a permitted caller for a service.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';

export interface UseIsPermittedCallerOptions {
  enabled?: boolean;
}

/**
 * Hook to check if an address is permitted to submit jobs for a service.
 *
 * @param serviceId - The service ID to check
 * @param caller - The address to check permission for
 * @param options - Configuration options
 */
export const useIsPermittedCaller = (
  serviceId: bigint | undefined,
  caller: Address | undefined,
  options?: UseIsPermittedCallerOptions,
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
    queryKey: ['isPermittedCaller', chainId, serviceId?.toString(), caller],
    queryFn: async (): Promise<boolean> => {
      if (
        !publicClient ||
        !contracts ||
        serviceId === undefined ||
        !caller
      ) {
        return false;
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return false;
      }

      const result = await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'isPermittedCaller',
        args: [serviceId, caller],
      });

      return result as boolean;
    },
    enabled:
      enabled &&
      !!publicClient &&
      !!contracts &&
      contracts.tangle !== zeroAddress &&
      serviceId !== undefined &&
      !!caller,
    staleTime: 30_000,
    retry: 2,
  });
};

export default useIsPermittedCaller;

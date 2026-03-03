/**
 * Hook for fetching exit queue configuration for a service.
 */

import { useQuery } from '@tanstack/react-query';
import { zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';

export interface ExitConfig {
  minCommitmentDuration: bigint;
  exitQueueDuration: bigint;
  forceExitAllowed: boolean;
}

export interface UseExitConfigOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch the exit queue configuration for a service.
 *
 * @param serviceId - The service ID to get exit config for
 * @param options - Configuration options
 */
export const useExitConfig = (
  serviceId: bigint | undefined,
  options?: UseExitConfigOptions,
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
    queryKey: ['exitConfig', chainId, serviceId?.toString()],
    queryFn: async (): Promise<ExitConfig | null> => {
      if (!publicClient || !contracts || serviceId === undefined) {
        return null;
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return null;
      }

      const result = await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'getExitConfig',
        args: [serviceId],
      });

      const config = result as {
        minCommitmentDuration: bigint;
        exitQueueDuration: bigint;
        forceExitAllowed: boolean;
      };

      return {
        minCommitmentDuration: config.minCommitmentDuration,
        exitQueueDuration: config.exitQueueDuration,
        forceExitAllowed: config.forceExitAllowed,
      };
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

export default useExitConfig;

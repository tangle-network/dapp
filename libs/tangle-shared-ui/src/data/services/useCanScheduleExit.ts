/**
 * Hook for checking if an operator can schedule an exit from a service.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';

export interface CanScheduleExitResult {
  canExit: boolean;
  reason: string;
}

export interface UseCanScheduleExitOptions {
  enabled?: boolean;
}

/**
 * Hook to check if an operator can schedule an exit from a service.
 *
 * @param serviceId - The service ID
 * @param operator - The operator address to check
 * @param options - Configuration options
 */
export const useCanScheduleExit = (
  serviceId: bigint | undefined,
  operator: Address | undefined,
  options?: UseCanScheduleExitOptions,
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
    queryKey: ['canScheduleExit', chainId, serviceId?.toString(), operator],
    queryFn: async (): Promise<CanScheduleExitResult> => {
      if (!publicClient || !contracts || serviceId === undefined || !operator) {
        return { canExit: false, reason: 'Missing required parameters' };
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return { canExit: false, reason: 'Contract not available' };
      }

      const result = await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'canScheduleExit',
        args: [serviceId, operator],
      });

      const [canExit, reason] = result as [boolean, string];

      return { canExit, reason };
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

export default useCanScheduleExit;

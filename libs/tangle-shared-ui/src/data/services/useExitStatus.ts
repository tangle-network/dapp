/**
 * Hook for fetching operator exit status for a service.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';

export enum ExitStatus {
  None = 0,
  Scheduled = 1,
  Executable = 2,
  Completed = 3,
}

export interface UseExitStatusOptions {
  enabled?: boolean;
}

export const getExitStatusLabel = (status: ExitStatus): string => {
  switch (status) {
    case ExitStatus.None:
      return 'None';
    case ExitStatus.Scheduled:
      return 'Scheduled';
    case ExitStatus.Executable:
      return 'Executable';
    case ExitStatus.Completed:
      return 'Completed';
    default:
      return 'Unknown';
  }
};

/**
 * Hook to fetch the exit status for an operator in a service.
 *
 * @param serviceId - The service ID
 * @param operator - The operator address to check status for
 * @param options - Configuration options
 */
export const useExitStatus = (
  serviceId: bigint | undefined,
  operator: Address | undefined,
  options?: UseExitStatusOptions,
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
    queryKey: ['exitStatus', chainId, serviceId?.toString(), operator],
    queryFn: async (): Promise<ExitStatus> => {
      if (
        !publicClient ||
        !contracts ||
        serviceId === undefined ||
        !operator
      ) {
        return ExitStatus.None;
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return ExitStatus.None;
      }

      const result = await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'getExitStatus',
        args: [serviceId, operator],
      });

      return result as ExitStatus;
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

export default useExitStatus;

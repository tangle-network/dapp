/**
 * Hook for fetching operator exit status for a service.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';
// `ExitStatus` + `getExitStatusLabel` live in the pure (wagmi-free) `exitStatus`
// module so they can be imported by unit-tested modules without pulling wagmi.
// `ExitStatus` is used below; both are re-exported so existing importers keep
// resolving them from this module.
import { ExitStatus } from './exitStatus';

export { ExitStatus, getExitStatusLabel } from './exitStatus';

export interface UseExitStatusOptions {
  enabled?: boolean;
}

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
      if (!publicClient || !contracts || serviceId === undefined || !operator) {
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

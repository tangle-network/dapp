/**
 * Hook for checking if an operator can schedule an exit from a service.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import {
  getContractsByChainId,
  getTntCoreRevisionByChainId,
} from '@tangle-network/dapp-config/contracts';

/**
 * tnt-core 0.19 removed the `canScheduleExit(uint64,address)` view, so it is no
 * longer present in the synced `TANGLE_ABI`. Keep a local fragment for the
 * legacy/v018 direct-read path; v019 chains degrade to a safe default below and
 * never reach this ABI.
 */
const CAN_SCHEDULE_EXIT_ABI = [
  {
    type: 'function',
    name: 'canScheduleExit',
    stateMutability: 'view',
    inputs: [
      { name: 'serviceId', type: 'uint64', internalType: 'uint64' },
      { name: 'operator', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: 'canExit', type: 'bool', internalType: 'bool' },
      { name: 'reason', type: 'string', internalType: 'string' },
    ],
  },
] as const;

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

      // tnt-core 0.19 removed the `canScheduleExit(uint64,address)` view. There
      // is no drop-in on-chain read on v019 (the eligibility is derivable from
      // `getExitStatus` + the service's exit config, wired in a follow-up), so
      // degrade to a safe, non-blocking default: the chain still enforces exit
      // rules at `scheduleExit` time. Fail closed on `canExit` so we never
      // render an exit action as available when we cannot verify it.
      if (getTntCoreRevisionByChainId(chainId) === 'v019') {
        return {
          canExit: false,
          reason: 'Exit eligibility unavailable on this chain',
        };
      }

      const result = await publicClient.readContract({
        address: tangleAddress,
        abi: CAN_SCHEDULE_EXIT_ABI,
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

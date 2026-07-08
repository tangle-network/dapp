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
// `ExitStatus` (the canonical tnt-core `Types.ExitStatus` mirror) plus the pure
// eligibility mapping / result type live in wagmi-free modules so they can be
// unit-tested; re-exported below so existing importers are unchanged.
import { ExitStatus } from './exitStatus';
import {
  type CanScheduleExitResult,
  mapExitStatusToEligibility,
} from './canScheduleExit';

export {
  mapExitStatusToEligibility,
  type CanScheduleExitResult,
} from './canScheduleExit';

/**
 * tnt-core 0.19 removed the `canScheduleExit(uint64,address)` view, so it is no
 * longer present in the synced `TANGLE_ABI`. Keep a local fragment for the
 * legacy/v018 direct-read path; v019 chains derive eligibility from
 * `getExitStatus` instead (see `EXIT_STATUS_ABI` and `mapExitStatusToEligibility`).
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

/**
 * v019 exit-eligibility read. tnt-core 0.19 dropped the boolean
 * `canScheduleExit` view but keeps `getExitStatus(uint64,address)`, which
 * returns the operator's position in the exit lifecycle. Eligibility to
 * SCHEDULE an exit is derivable from it: only an operator not already in the
 * queue (`None`) may schedule.
 */
const EXIT_STATUS_ABI = [
  {
    type: 'function',
    name: 'getExitStatus',
    stateMutability: 'view',
    inputs: [
      { name: 'serviceId', type: 'uint64', internalType: 'uint64' },
      { name: 'operator', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '', type: 'uint8', internalType: 'enum Types.ExitStatus' },
    ],
  },
] as const;

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

      // tnt-core 0.19 removed the `canScheduleExit(uint64,address)` view but
      // keeps `getExitStatus`. Derive schedule-exit eligibility from it: an
      // operator can schedule only when they are not already in the exit queue
      // (`ExitStatus.None`). The chain still enforces the full exit rules at
      // `scheduleExit` time — this read just governs the UI affordance.
      if (getTntCoreRevisionByChainId(chainId) === 'v019') {
        const status = (await publicClient.readContract({
          address: tangleAddress,
          abi: EXIT_STATUS_ABI,
          functionName: 'getExitStatus',
          args: [serviceId, operator],
        })) as ExitStatus;

        return mapExitStatusToEligibility(status);
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

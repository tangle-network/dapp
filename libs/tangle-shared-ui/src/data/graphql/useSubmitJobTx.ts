/**
 * Hook to submit a job to a service.
 *
 * For native token payments, include the `value` parameter.
 * For ERC20 payments, ensure approval is done first (use useErc20Approval hook).
 */

import { useQueryClient } from '@tanstack/react-query';
import { type Address, zeroAddress } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import useContractWrite, {
  TxStatus,
} from '../../hooks/useContractWrite';
import TANGLE_ABI from '../../abi/tangle';
import type { JobCall } from './useJobs';
import { OPTIMISTIC_JOB_ID_PREFIX, isOptimisticJob } from './useJobs';

export type SubmitJobStatus = 'idle' | 'pending' | 'success' | 'error';

const JOBS_RECONCILE_BACKOFF_MS = [
  1_000, 2_000, 4_000, 8_000, 16_000,
] as const;

const sortJobsBySubmittedAtDesc = (jobs: JobCall[]): JobCall[] =>
  [...jobs].sort((a, b) => {
    if (a.submittedAt === b.submittedAt) return 0;
    return a.submittedAt > b.submittedAt ? -1 : 1;
  });

export interface SubmitJobParams {
  serviceId: bigint;
  jobIndex: number;
  inputs: `0x${string}`;
  /** Payment amount for native token (ETH). Set this when isNativeToken is true */
  value?: bigint;
}

export const useSubmitJobTx = () => {
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { address } = useAccount();

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = chainId ? getContractsByChainId(chainId) : null;
  } catch {
    contracts = null;
  }

  const contractsRef = contracts;

  /**
   * Exponential backoff reconciliation: invalidate the jobs query repeatedly
   * until all optimistic rows have been replaced by canonical indexer data.
   */
  const scheduleJobsReconciliation = (serviceId: bigint) => {
    const jobsByServicePrefix = [
      'jobs',
      'byService',
      serviceId.toString(),
    ] as const;

    const runAttempt = async (attempt: number): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: jobsByServicePrefix });

      const hasOptimistic = queryClient
        .getQueriesData<JobCall[]>({ queryKey: jobsByServicePrefix })
        .some(([, jobs]) => (jobs ?? []).some(isOptimisticJob));

      if (
        !hasOptimistic ||
        attempt >= JOBS_RECONCILE_BACKOFF_MS.length - 1
      ) {
        return;
      }

      setTimeout(() => {
        void runAttempt(attempt + 1);
      }, JOBS_RECONCILE_BACKOFF_MS[attempt + 1]);
    };

    setTimeout(() => {
      void runAttempt(0);
    }, JOBS_RECONCILE_BACKOFF_MS[0]);
  };

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: SubmitJobParams, _activeAddress) => {
      if (!contractsRef) return null;

      return {
        address: contractsRef.tangle,
        abi: TANGLE_ABI,
        functionName: 'submitJob' as const,
        args: [params.serviceId, params.jobIndex, params.inputs] as const,
        value: params.value,
      };
    },
    {
      txName: 'submit job',
      txDetails: (params) =>
        new Map([
          ['Service ID', params.serviceId.toString()],
          ['Job Index', params.jobIndex.toString()],
        ]),
      getSuccessMessage: (params) =>
        `Job submitted to service #${params.serviceId}`,
      onSuccess: (txResult, params) => {
        const submittedAt = BigInt(Math.floor(Date.now() / 1000));

        const optimisticJob: JobCall = {
          id: `${OPTIMISTIC_JOB_ID_PREFIX}${txResult.hash}`,
          serviceId: params.serviceId,
          callId: BigInt(-1), // Placeholder — replaced by canonical data on next refetch
          jobIndex: params.jobIndex,
          submitter: (address ?? zeroAddress) as Address,
          inputs: params.inputs,
          submittedAt,
          completed: false,
          resultCount: 0,
          payment: params.value ?? BigInt(0),
        };

        const jobsByServicePrefix = [
          'jobs',
          'byService',
          params.serviceId.toString(),
        ] as const;

        // Optimistically insert the new job into the cache (synchronous)
        queryClient.setQueriesData<JobCall[]>(
          { queryKey: jobsByServicePrefix },
          (currentJobs = []) =>
            sortJobsBySubmittedAtDesc([optimisticJob, ...currentJobs]),
        );

        // Invalidate related queries
        void queryClient.invalidateQueries({ queryKey: ['jobCalls'] });
        void queryClient.invalidateQueries({ queryKey: ['serviceEscrow'] });

        // Schedule backoff reconciliation to replace optimistic with canonical
        scheduleJobsReconciliation(params.serviceId);
      },
    },
  );

  // Map useContractWrite status to the existing SubmitJobStatus interface
  const status: SubmitJobStatus =
    hook.status === TxStatus.PROCESSING
      ? 'pending'
      : hook.status === TxStatus.COMPLETE
        ? 'success'
        : hook.status === TxStatus.ERROR
          ? 'error'
          : 'idle';

  return {
    submitJob: hook.execute,
    status,
    error: hook.error,
    reset: hook.reset,
  };
};

export default useSubmitJobTx;

/**
 * Hooks for fetching job data from the Envio indexer.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Address } from 'viem';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';

export const OPTIMISTIC_JOB_ID_PREFIX = 'optimistic:';
const OPTIMISTIC_JOB_TTL_SECONDS = BigInt(120);
const FAST_JOBS_REFETCH_INTERVAL_MS = 2_000;
const DEFAULT_JOBS_REFETCH_INTERVAL_MS = 15_000;

// Job call status
export type JobStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

// Job call from indexer
export interface JobCall {
  id: string;
  serviceId: bigint;
  callId: bigint;
  jobIndex: number;
  submitter: Address;
  inputs: string; // Encoded inputs
  submittedAt: bigint;
  completed: boolean;
  resultCount: number;
  payment: bigint;
}

// Job result from indexer
export interface JobResult {
  id: string;
  callId: bigint;
  operator: Address | null;
  aggregated: boolean;
  result: string; // Encoded result
  submittedAt: bigint;
}

// Raw response from GraphQL
interface JobCallQueryResponse {
  JobCall: Array<{
    id: string;
    service: {
      serviceId: string;
    } | null;
    callId: string;
    jobIndex: number;
    caller: string;
    inputs: string;
    createdAt: string;
    completed: boolean;
    results: Array<{
      id: string;
    }>;
  }>;
}

interface JobResultQueryResponse {
  JobResult: Array<{
    id: string;
    jobCall: {
      callId: string;
    } | null;
    operator: {
      id: string;
    } | null;
    aggregated: boolean;
    output: string;
    submittedAt: string;
  }>;
}

// Fetch jobs for a service
const fetchJobsByService = async (
  serviceId: bigint,
  network?: EnvioNetwork,
  limit = 50,
): Promise<JobCall[]> => {
  const query = `
    query GetJobsByService($serviceId: String!, $limit: Int!) {
      JobCall(
        where: { service: { serviceId: { _eq: $serviceId } } }
        order_by: { createdAt: desc }
        limit: $limit
      ) {
        id
        service {
          serviceId
        }
        callId
        jobIndex
        caller
        inputs
        createdAt
        completed
        results {
          id
        }
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    JobCallQueryResponse,
    { serviceId: string; limit: number }
  >(query, { serviceId: serviceId.toString(), limit }, network);

  return (result.data.JobCall ?? []).map((job) => ({
    id: job.id,
    serviceId: BigInt(job.service?.serviceId ?? '0'),
    callId: BigInt(job.callId),
    jobIndex: job.jobIndex,
    submitter: job.caller as Address,
    inputs: job.inputs,
    submittedAt: BigInt(job.createdAt),
    completed: job.completed,
    resultCount: job.results.length,
    payment: BigInt(0),
  }));
};

// Fetch job results
const fetchJobResults = async (
  jobCallId: string,
  network?: EnvioNetwork,
): Promise<JobResult[]> => {
  const query = `
    query GetJobResults($callId: String!) {
      JobResult(
        where: { jobCall: { id: { _eq: $callId } } }
        order_by: { submittedAt: asc }
      ) {
        id
        jobCall {
          callId
        }
        operator {
          id
        }
        aggregated
        output
        submittedAt
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    JobResultQueryResponse,
    { callId: string }
  >(query, { callId: jobCallId }, network);

  return (result.data.JobResult ?? []).map((res) => ({
    id: res.id,
    callId: BigInt(res.jobCall?.callId ?? '0'),
    operator: res.operator?.id ? (res.operator.id as Address) : null,
    aggregated: res.aggregated,
    result: res.output,
    submittedAt: BigInt(res.submittedAt),
  }));
};

export const isOptimisticJob = (job: JobCall): boolean =>
  job.id.startsWith(OPTIMISTIC_JOB_ID_PREFIX);

const sortJobsBySubmittedAtDesc = (jobs: JobCall[]): JobCall[] =>
  [...jobs].sort((a, b) => {
    if (a.submittedAt === b.submittedAt) return 0;
    return a.submittedAt > b.submittedAt ? -1 : 1;
  });

const bigIntAbsDiff = (a: bigint, b: bigint): bigint => (a > b ? a - b : b - a);

/**
 * Merge fetched jobs with any still-pending optimistic entries.
 * Optimistic rows are dropped once the indexer returns a matching canonical row
 * or after TTL expiry. Matching uses fuzzy criteria (same serviceId, jobIndex,
 * submitter, and submittedAt within 60s) since the optimistic row doesn't know
 * the real callId.
 */
const mergeFetchedWithOptimisticJobs = (
  fetchedJobs: JobCall[],
  cachedJobs: JobCall[] | undefined,
): JobCall[] => {
  if (!cachedJobs || cachedJobs.length === 0) return fetchedJobs;

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));

  const pendingOptimisticJobs = cachedJobs.filter((job) => {
    if (!isOptimisticJob(job)) return false;
    if (nowSeconds - job.submittedAt > OPTIMISTIC_JOB_TTL_SECONDS) return false;

    // Fuzzy match: drop if a canonical row exists with same service, jobIndex,
    // submitter, and submittedAt within 60 seconds
    const hasCanonicalMatch = fetchedJobs.some(
      (fetched) =>
        fetched.serviceId === job.serviceId &&
        fetched.jobIndex === job.jobIndex &&
        fetched.submitter.toLowerCase() === job.submitter.toLowerCase() &&
        bigIntAbsDiff(fetched.submittedAt, job.submittedAt) <= BigInt(60),
    );
    if (hasCanonicalMatch) return false;

    return true;
  });

  return sortJobsBySubmittedAtDesc([...pendingOptimisticJobs, ...fetchedJobs]);
};

/**
 * Hook to fetch jobs for a service.
 */
export const useJobsByService = (
  serviceId: bigint | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
    limit?: number;
  },
) => {
  const { network, enabled = true, limit = 50 } = options ?? {};
  const queryClient = useQueryClient();
  const queryKey = [
    'jobs',
    'byService',
    serviceId?.toString(),
    network,
    limit,
  ] as const;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (serviceId === undefined) return [];
      const fetchedJobs = await fetchJobsByService(serviceId, network, limit);
      const cachedJobs = queryClient.getQueryData<JobCall[]>(queryKey);
      return mergeFetchedWithOptimisticJobs(fetchedJobs, cachedJobs);
    },
    enabled: enabled && serviceId !== undefined,
    staleTime: 10_000,
    refetchInterval: (query) => {
      const jobs = query.state.data as JobCall[] | undefined;
      return jobs?.some(isOptimisticJob)
        ? FAST_JOBS_REFETCH_INTERVAL_MS
        : DEFAULT_JOBS_REFETCH_INTERVAL_MS;
    },
  });
};

/**
 * Hook to fetch results for a specific job call.
 */
export const useJobResults = (
  jobCallId: string | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { network, enabled = true } = options ?? {};

  return useQuery({
    queryKey: ['jobs', 'results', jobCallId, network],
    queryFn: async () => {
      if (jobCallId === undefined) return [];
      return fetchJobResults(jobCallId, network);
    },
    enabled: enabled && jobCallId !== undefined,
    staleTime: 10_000,
  });
};

export default useJobsByService;

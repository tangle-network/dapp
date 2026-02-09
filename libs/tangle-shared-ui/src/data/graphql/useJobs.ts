/**
 * Hooks for fetching job data from the Envio indexer.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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
  operator: Address;
  result: string; // Encoded result
  submittedAt: bigint;
}

// Raw response from GraphQL
interface JobCallQueryResponse {
  JobCall: Array<{
    id: string;
    service_id: string;
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
    jobCall_id: string;
    operator_id: string | null;
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
        where: { service_id: { _eq: $serviceId } }
        order_by: { createdAt: desc }
        limit: $limit
      ) {
        id
        service_id
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
    serviceId: BigInt(job.service_id),
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
        where: { jobCall_id: { _eq: $callId } }
        order_by: { submittedAt: asc }
      ) {
        id
        jobCall_id
        operator_id
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
    callId: BigInt(res.jobCall_id.split('-').pop() ?? '0'),
    operator: (res.operator_id ?? ZERO_ADDRESS) as Address,
    result: res.output,
    submittedAt: BigInt(res.submittedAt),
  }));
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

  return useQuery({
    queryKey: ['jobs', 'byService', serviceId?.toString(), network, limit],
    queryFn: async () => {
      if (serviceId === undefined) return [];
      return fetchJobsByService(serviceId, network, limit);
    },
    enabled: enabled && serviceId !== undefined,
    staleTime: 10_000, // 10 seconds - jobs can change frequently
    refetchInterval: 15_000, // Refresh every 15 seconds
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

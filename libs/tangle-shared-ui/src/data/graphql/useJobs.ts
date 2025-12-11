/**
 * Hooks for fetching job data from the Envio indexer.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';

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
    serviceId: string;
    callId: string;
    jobIndex: number;
    submitter: string;
    inputs: string;
    submittedAt: string;
    completed: boolean;
    resultCount: number;
    payment: string;
  }>;
}

interface JobResultQueryResponse {
  JobResult: Array<{
    id: string;
    callId: string;
    operator: string;
    result: string;
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
        where: { serviceId: { _eq: $serviceId } }
        order_by: { submittedAt: desc }
        limit: $limit
      ) {
        id
        serviceId
        callId
        jobIndex
        submitter
        inputs
        submittedAt
        completed
        resultCount
        payment
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    JobCallQueryResponse,
    { serviceId: string; limit: number }
  >(query, { serviceId: serviceId.toString(), limit }, network);

  return (result.data.JobCall ?? []).map((job) => ({
    id: job.id,
    serviceId: BigInt(job.serviceId),
    callId: BigInt(job.callId),
    jobIndex: job.jobIndex,
    submitter: job.submitter as Address,
    inputs: job.inputs,
    submittedAt: BigInt(job.submittedAt),
    completed: job.completed,
    resultCount: job.resultCount,
    payment: BigInt(job.payment),
  }));
};

// Fetch job results
const fetchJobResults = async (
  callId: bigint,
  network?: EnvioNetwork,
): Promise<JobResult[]> => {
  const query = `
    query GetJobResults($callId: String!) {
      JobResult(
        where: { callId: { _eq: $callId } }
        order_by: { submittedAt: asc }
      ) {
        id
        callId
        operator
        result
        submittedAt
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    JobResultQueryResponse,
    { callId: string }
  >(query, { callId: callId.toString() }, network);

  return (result.data.JobResult ?? []).map((res) => ({
    id: res.id,
    callId: BigInt(res.callId),
    operator: res.operator as Address,
    result: res.result,
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
  callId: bigint | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { network, enabled = true } = options ?? {};

  return useQuery({
    queryKey: ['jobs', 'results', callId?.toString(), network],
    queryFn: async () => {
      if (callId === undefined) return [];
      return fetchJobResults(callId, network);
    },
    enabled: enabled && callId !== undefined,
    staleTime: 10_000,
  });
};

export default useJobsByService;

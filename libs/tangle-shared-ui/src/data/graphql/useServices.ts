/**
 * Hooks for fetching service/instance data from the Envio indexer.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Address } from 'viem';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';

// Service status enum matching Tangle contract
export type ServiceStatus = 'PENDING' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED';

// Service instance from indexer
export interface Service {
  id: string;
  serviceId: bigint;
  blueprintId: bigint;
  owner: Address;
  status: ServiceStatus;
  operators: Address[];
  createdAt: bigint;
  terminatedAt: bigint | null;
}

// Service request from indexer
export interface ServiceRequest {
  id: string;
  requestId: bigint;
  blueprintId: bigint;
  requester: Address;
  operatorCandidates: Address[];
  approvedOperators: Address[];
  rejectedOperators: Address[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVATED';
  createdAt: bigint;
  approvalCount: bigint;
  securityRequirements: string | null;
}

// Raw response types
interface ServiceQueryResponse {
  Service: Array<{
    id: string;
    serviceId: string;
    blueprint_id: string;
    owner: string;
    status: string;
    createdAt: string;
    terminatedAt: string | null;
    request: {
      operatorCandidates: string[];
    } | null;
  }>;
}

interface ServiceRequestQueryResponse {
  ServiceRequest: Array<{
    id: string;
    requestId: string;
    blueprint_id: string;
    requester: string;
    operatorCandidates: string[];
    approvedOperators: string[];
    rejectedOperators: string[];
    status: string;
    createdAt: string;
    approvalCount: string;
    securityRequirements: string | null;
  }>;
}

// Fetch services from GraphQL
const fetchServices = async (
  options: {
    owner?: Address;
    operator?: Address;
    status?: ServiceStatus;
    blueprintId?: bigint;
    serviceId?: bigint;
    limit?: number;
    offset?: number;
  },
  network?: EnvioNetwork,
): Promise<Service[]> => {
  const where: string[] = [];
  if (options.owner) {
    where.push(`owner: { _eq: "${options.owner.toLowerCase()}" }`);
  }
  if (options.operator) {
    // Filter by operator via the request's operatorCandidates
    // (serviceOperators relationship isn't reliably populated by indexer)
    where.push(
      `request: { operatorCandidates: { _contains: ["${options.operator.toLowerCase()}"] } }`,
    );
  }
  if (options.status) {
    where.push(`status: { _eq: "${options.status}" }`);
  }
  if (options.blueprintId !== undefined) {
    where.push(`blueprint_id: { _eq: "${options.blueprintId}" }`);
  }
  if (options.serviceId !== undefined) {
    where.push(`serviceId: { _eq: "${options.serviceId}" }`);
  }

  const whereClause = where.length > 0 ? `where: { ${where.join(', ')} }` : '';

  const query = `
    query GetServices($limit: Int!, $offset: Int!) {
      Service(
        limit: $limit
        offset: $offset
        ${whereClause}
        order_by: { createdAt: desc }
      ) {
        id
        serviceId
        blueprint_id
        owner
        status
        createdAt
        terminatedAt
        request {
          operatorCandidates
        }
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    ServiceQueryResponse,
    {
      limit: number;
      offset: number;
    }
  >(
    query,
    { limit: options.limit ?? 100, offset: options.offset ?? 0 },
    network,
  );

  if (result.errors?.length) {
    console.error('GraphQL errors:', result.errors);
  }

  return (result.data.Service ?? []).map((s) => ({
    id: s.id,
    serviceId: BigInt(s.serviceId),
    blueprintId: BigInt(s.blueprint_id),
    owner: s.owner as Address,
    status: s.status as ServiceStatus,
    operators: (s.request?.operatorCandidates ?? []) as Address[],
    createdAt: BigInt(s.createdAt),
    terminatedAt: s.terminatedAt ? BigInt(s.terminatedAt) : null,
  }));
};

// Fetch service requests from GraphQL
const fetchServiceRequests = async (
  options: {
    requester?: Address;
    operator?: Address;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    blueprintId?: bigint;
    limit?: number;
    offset?: number;
  },
  network?: EnvioNetwork,
): Promise<ServiceRequest[]> => {
  const where: string[] = [];
  if (options.requester) {
    where.push(`requester: { _eq: "${options.requester.toLowerCase()}" }`);
  }
  if (options.operator) {
    where.push(
      `operatorCandidates: { _contains: ["${options.operator.toLowerCase()}"] }`,
    );
  }
  if (options.status) {
    where.push(`status: { _eq: "${options.status}" }`);
  }
  if (options.blueprintId !== undefined) {
    where.push(`blueprint_id: { _eq: "${options.blueprintId}" }`);
  }

  const whereClause = where.length > 0 ? `where: { ${where.join(', ')} }` : '';

  const query = `
    query GetServiceRequests($limit: Int!, $offset: Int!) {
      ServiceRequest(
        limit: $limit
        offset: $offset
        ${whereClause}
        order_by: { createdAt: desc }
      ) {
        id
        requestId
        blueprint_id
        requester
        operatorCandidates
        approvedOperators
        rejectedOperators
        status
        createdAt
        approvalCount
        securityRequirements
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    ServiceRequestQueryResponse,
    {
      limit: number;
      offset: number;
    }
  >(
    query,
    { limit: options.limit ?? 100, offset: options.offset ?? 0 },
    network,
  );

  if (result.errors?.length) {
    console.error('GraphQL errors:', result.errors);
  }

  return (result.data.ServiceRequest ?? []).map((r) => ({
    id: r.id,
    requestId: BigInt(r.requestId),
    blueprintId: BigInt(r.blueprint_id),
    requester: r.requester as Address,
    operatorCandidates: r.operatorCandidates as Address[],
    approvedOperators: (r.approvedOperators ?? []) as Address[],
    rejectedOperators: (r.rejectedOperators ?? []) as Address[],
    status: r.status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVATED',
    createdAt: BigInt(r.createdAt),
    approvalCount: BigInt(r.approvalCount ?? '0'),
    securityRequirements: r.securityRequirements,
  }));
};

/**
 * Hook to fetch services by owner (deployed services).
 */
export const useServicesByOwner = (
  owner: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
    status?: ServiceStatus;
  },
) => {
  const { network, enabled = true, status } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'services', 'owner', owner, status, network],
    queryFn: async () => {
      if (!owner) return [];
      return fetchServices({ owner, status }, network);
    },
    enabled: enabled && !!owner,
    staleTime: 30_000,
  });
};

/**
 * Hook to fetch services where user is an operator.
 */
export const useServicesByOperator = (
  operator: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
    status?: ServiceStatus;
  },
) => {
  const { network, enabled = true, status } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'services', 'operator', operator, status, network],
    queryFn: async () => {
      if (!operator) return [];
      return fetchServices({ operator, status }, network);
    },
    enabled: enabled && !!operator,
    staleTime: 30_000,
  });
};

/**
 * Hook to fetch pending service requests for an operator.
 */
export const usePendingServiceRequests = (
  operator: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { network, enabled = true } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'serviceRequests', 'pending', operator, network],
    queryFn: async () => {
      if (!operator) return [];
      return fetchServiceRequests({ operator, status: 'PENDING' }, network);
    },
    enabled: enabled && !!operator,
    staleTime: 30_000,
  });
};

/**
 * Hook to fetch service requests where the operator has already taken action.
 * This includes requests with any status (PENDING, APPROVED, REJECTED) where
 * the operator is in either approvedOperators or rejectedOperators arrays.
 */
export const useOperatorActedServiceRequests = (
  operator: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { network, enabled = true } = options ?? {};

  // Fetch all requests for this operator in a single query (no status filter)
  const allRequestsQuery = useQuery({
    queryKey: ['envio', 'serviceRequests', 'all', operator, network],
    queryFn: async () => {
      if (!operator) return [];
      // Fetch without status filter to get all requests in one API call
      return fetchServiceRequests({ operator }, network);
    },
    enabled: enabled && !!operator,
    staleTime: 30_000,
  });

  // Filter to only include requests where operator has acted (excluding ACTIVATED)
  const filteredData = useMemo(() => {
    if (!operator || !allRequestsQuery.data) return [];

    const normalizedOperator = operator.toLowerCase();

    // Filter to only include requests where operator has approved or rejected
    // Exclude ACTIVATED requests as they are shown in the Running table
    const actedRequests = allRequestsQuery.data.filter((request) => {
      // Skip activated requests - they belong in Running table
      if (request.status === 'ACTIVATED') return false;

      const hasApproved = request.approvedOperators?.some(
        (addr) => addr.toLowerCase() === normalizedOperator,
      );
      const hasRejected = request.rejectedOperators?.some(
        (addr) => addr.toLowerCase() === normalizedOperator,
      );
      return hasApproved || hasRejected;
    });

    return actedRequests.sort((a, b) => Number(b.createdAt - a.createdAt));
  }, [operator, allRequestsQuery.data]);

  return {
    data: filteredData,
    isLoading: allRequestsQuery.isLoading,
    error: allRequestsQuery.error,
    refetch: allRequestsQuery.refetch,
  };
};

// Keep the old export for backwards compatibility
export const useApprovedServiceRequests = useOperatorActedServiceRequests;

/**
 * Hook to fetch operator stats.
 */
export const useOperatorStats = (
  operator: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { network, enabled = true } = options ?? {};

  const { data: activeServices } = useServicesByOperator(operator, {
    network,
    enabled,
    status: 'ACTIVE',
  });

  const { data: pendingRequests } = usePendingServiceRequests(operator, {
    network,
    enabled,
  });

  return useQuery({
    queryKey: [
      'envio',
      'operatorStats',
      operator,
      network,
      activeServices?.length,
      pendingRequests?.length,
    ],
    queryFn: async () => {
      if (!operator) return null;

      // Query blueprint registrations
      const blueprintQuery = `
        query GetOperatorBlueprints($operator: String!) {
          OperatorBlueprint(where: { operator: { id: { _eq: $operator } } }) {
            id
            blueprint {
              blueprintId
            }
          }
        }
      `;

      const blueprintResult = await executeEnvioGraphQL<
        {
          OperatorBlueprint: Array<{
            id: string;
            blueprint: { blueprintId: string };
          }>;
        },
        { operator: string }
      >(blueprintQuery, { operator: operator.toLowerCase() }, network);

      return {
        registeredBlueprints:
          blueprintResult.data.OperatorBlueprint?.length ?? 0,
        runningServices: activeServices?.length ?? 0,
        pendingServices: pendingRequests?.length ?? 0,
        avgUptime: 0, // TODO: Calculate from metrics
        deployedServices: 0, // TODO: Query owned services
        publishedBlueprints: 0, // TODO: Query owned blueprints
      };
    },
    enabled: enabled && !!operator,
    staleTime: 60_000,
  });
};

/**
 * Hook to fetch a single service by its serviceId.
 * No owner/operator filter — visible to all users.
 */
export const useServiceById = (
  serviceId: bigint | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { network, enabled = true } = options ?? {};

  const query = useQuery({
    queryKey: ['envio', 'services', 'byId', serviceId?.toString(), network],
    queryFn: async () => {
      if (serviceId === undefined) return null;
      const services = await fetchServices({ serviceId, limit: 1 }, network);
      return services[0] ?? null;
    },
    enabled: enabled && serviceId !== undefined,
    staleTime: 30_000,
  });

  return query;
};

/**
 * Hook to fetch all services with optional filters.
 * No owner/operator filter — visible to all users.
 */
export const useAllServices = (options?: {
  status?: ServiceStatus;
  blueprintId?: bigint;
  limit?: number;
  offset?: number;
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const {
    status,
    blueprintId,
    limit,
    offset,
    network,
    enabled = true,
  } = options ?? {};

  return useQuery({
    queryKey: [
      'envio',
      'services',
      'all',
      status,
      blueprintId?.toString(),
      limit,
      offset,
      network,
    ],
    queryFn: async () => {
      return fetchServices({ status, blueprintId, limit, offset }, network);
    },
    enabled,
    staleTime: 30_000,
  });
};

export default useServicesByOwner;

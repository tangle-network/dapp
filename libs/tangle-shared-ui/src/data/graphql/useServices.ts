/**
 * Hooks for fetching service/instance data from the Envio indexer.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';
import { MembershipModel } from '../services/useServiceRequestDetails';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import useNetworkStore from '../../context/useNetworkStore';

// Service status enum matching Tangle contract
export type ServiceStatus = 'PENDING' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
export type ServiceRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVATED';

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
  status: ServiceRequestStatus;
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

const useResolvedEnvioNetwork = (network?: EnvioNetwork): EnvioNetwork => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);

  return network ?? getEnvioNetworkFromChainId(activeChainId);
};

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
    throw new Error(
      `Failed to fetch services: ${result.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
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
    status?: ServiceRequestStatus;
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
    throw new Error(
      `Failed to fetch service requests: ${result.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }

  return (result.data.ServiceRequest ?? []).map((r) => ({
    id: r.id,
    requestId: BigInt(r.requestId),
    blueprintId: BigInt(r.blueprint_id),
    requester: r.requester as Address,
    operatorCandidates: r.operatorCandidates as Address[],
    approvedOperators: (r.approvedOperators ?? []) as Address[],
    rejectedOperators: (r.rejectedOperators ?? []) as Address[],
    status: r.status as ServiceRequestStatus,
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
  const resolvedNetwork = useResolvedEnvioNetwork(network);

  return useQuery({
    queryKey: ['envio', 'services', 'owner', owner, status, resolvedNetwork],
    queryFn: async () => {
      if (!owner) return [];
      return fetchServices({ owner, status }, resolvedNetwork);
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
  const resolvedNetwork = useResolvedEnvioNetwork(network);

  return useQuery({
    queryKey: [
      'envio',
      'services',
      'operator',
      operator,
      status,
      resolvedNetwork,
    ],
    queryFn: async () => {
      if (!operator) return [];
      return fetchServices({ operator, status }, resolvedNetwork);
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
  const resolvedNetwork = useResolvedEnvioNetwork(network);

  return useQuery({
    queryKey: [
      'envio',
      'serviceRequests',
      'pending',
      operator,
      resolvedNetwork,
    ],
    queryFn: async () => {
      if (!operator) return [];
      return fetchServiceRequests(
        { operator, status: 'PENDING' },
        resolvedNetwork,
      );
    },
    enabled: enabled && !!operator,
    staleTime: 30_000,
  });
};

/**
 * Hook to fetch service requests by requester, with optional status filtering.
 */
export const useServiceRequestsByRequester = (
  requester: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
    status?: ServiceRequestStatus;
  },
) => {
  const { network, enabled = true, status } = options ?? {};
  const resolvedNetwork = useResolvedEnvioNetwork(network);

  return useQuery({
    queryKey: [
      'envio',
      'serviceRequests',
      'requester',
      requester,
      status,
      resolvedNetwork,
    ],
    queryFn: async () => {
      if (!requester) return [];
      return fetchServiceRequests({ requester, status }, resolvedNetwork);
    },
    enabled: enabled && !!requester,
    staleTime: 30_000,
  });
};

export interface OperatorStatsResult {
  registeredBlueprints: number;
  runningServices: number;
  pendingServices: number;
  avgUptime: number | null;
  deployedServices: number;
  publishedBlueprints: number;
}

interface OperatorStatsAggregateQueryResponse {
  OperatorRegistration_aggregate: {
    aggregate: {
      count: number;
    } | null;
  } | null;
  Service_aggregate: {
    aggregate: {
      count: number;
    } | null;
  } | null;
  Blueprint_aggregate: {
    aggregate: {
      count: number;
    } | null;
  } | null;
}

interface OperatorStatsFallbackQueryResponse {
  OperatorRegistration: Array<{ id: string }>;
  Service: Array<{ id: string }>;
  Blueprint: Array<{ id: string }>;
}

const isAggregateFieldUnavailable = (
  errors: Array<{ message: string }> | undefined,
): boolean => {
  if (!errors?.length) {
    return false;
  }

  return errors.some((error) => {
    const message = error.message.toLowerCase();
    return (
      message.includes('_aggregate') &&
      (message.includes('not found') || message.includes('cannot query field'))
    );
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
  const resolvedNetwork = useResolvedEnvioNetwork(network);

  // Fetch all requests for this operator in a single query (no status filter)
  const allRequestsQuery = useQuery({
    queryKey: ['envio', 'serviceRequests', 'all', operator, resolvedNetwork],
    queryFn: async () => {
      if (!operator) return [];
      // Fetch without status filter to get all requests in one API call
      return fetchServiceRequests({ operator }, resolvedNetwork);
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
  const resolvedNetwork = useResolvedEnvioNetwork(network);

  const { data: activeServices } = useServicesByOperator(operator, {
    network: resolvedNetwork,
    enabled,
    status: 'ACTIVE',
  });

  const { data: pendingRequests } = usePendingServiceRequests(operator, {
    network: resolvedNetwork,
    enabled,
  });

  return useQuery<OperatorStatsResult | null>({
    queryKey: [
      'envio',
      'operatorStats',
      operator,
      resolvedNetwork,
      activeServices?.length,
      pendingRequests?.length,
    ],
    queryFn: async () => {
      if (!operator) return null;

      const normalizedOperator = operator.toLowerCase();

      // Canonical source for operator membership in blueprints:
      // OperatorRegistration rows with status ACTIVE.
      const operatorStatsAggregateQuery = `
        query GetOperatorStats($operator: String!) {
          OperatorRegistration_aggregate(
            where: {
              operator: { id: { _eq: $operator } }
              status: { _eq: "ACTIVE" }
            }
          ) {
            aggregate {
              count
            }
          }
          Service_aggregate(where: { owner: { _eq: $operator } }) {
            aggregate {
              count
            }
          }
          Blueprint_aggregate(where: { owner: { _eq: $operator } }) {
            aggregate {
              count
            }
          }
        }
      `;

      const aggregateStatsResult = await executeEnvioGraphQL<
        OperatorStatsAggregateQueryResponse,
        { operator: string }
      >(
        operatorStatsAggregateQuery,
        { operator: normalizedOperator },
        resolvedNetwork,
      );

      if (!aggregateStatsResult.errors?.length) {
        return {
          registeredBlueprints:
            aggregateStatsResult.data.OperatorRegistration_aggregate?.aggregate
              ?.count ?? 0,
          runningServices: activeServices?.length ?? 0,
          pendingServices: pendingRequests?.length ?? 0,
          avgUptime: null,
          deployedServices:
            aggregateStatsResult.data.Service_aggregate?.aggregate?.count ?? 0,
          publishedBlueprints:
            aggregateStatsResult.data.Blueprint_aggregate?.aggregate?.count ??
            0,
        };
      }

      if (!isAggregateFieldUnavailable(aggregateStatsResult.errors)) {
        throw new Error(
          `Failed to fetch operator stats: ${aggregateStatsResult.errors
            .map((error) => error.message)
            .join('; ')}`,
        );
      }

      // Some indexer schemas/roles do not expose *_aggregate fields.
      // Fallback to paginated row counting to keep stats available.
      const fallbackPageSize = 1000;
      const operatorStatsFallbackQuery = `
        query GetOperatorStatsFallback(
          $operator: String!
          $limit: Int!
          $offset: Int!
        ) {
          OperatorRegistration(
            where: {
              operator: { id: { _eq: $operator } }
              status: { _eq: "ACTIVE" }
            }
            limit: $limit
            offset: $offset
          ) {
            id
          }
          Service(
            where: { owner: { _eq: $operator } }
            limit: $limit
            offset: $offset
          ) {
            id
          }
          Blueprint(
            where: { owner: { _eq: $operator } }
            limit: $limit
            offset: $offset
          ) {
            id
          }
        }
      `;

      let offset = 0;
      let registeredBlueprints = 0;
      let deployedServices = 0;
      let publishedBlueprints = 0;
      let hasMore = true;

      while (hasMore) {
        const fallbackStatsResult = await executeEnvioGraphQL<
          OperatorStatsFallbackQueryResponse,
          { operator: string; limit: number; offset: number }
        >(
          operatorStatsFallbackQuery,
          {
            operator: normalizedOperator,
            limit: fallbackPageSize,
            offset,
          },
          resolvedNetwork,
        );

        if (fallbackStatsResult.errors?.length) {
          throw new Error(
            `Failed to fetch operator stats: ${fallbackStatsResult.errors
              .map((error) => error.message)
              .join('; ')}`,
          );
        }

        const registrationChunkCount =
          fallbackStatsResult.data.OperatorRegistration?.length ?? 0;
        const serviceChunkCount = fallbackStatsResult.data.Service?.length ?? 0;
        const blueprintChunkCount =
          fallbackStatsResult.data.Blueprint?.length ?? 0;

        registeredBlueprints += registrationChunkCount;
        deployedServices += serviceChunkCount;
        publishedBlueprints += blueprintChunkCount;

        hasMore =
          registrationChunkCount === fallbackPageSize ||
          serviceChunkCount === fallbackPageSize ||
          blueprintChunkCount === fallbackPageSize;
        offset += fallbackPageSize;
      }

      return {
        registeredBlueprints,
        runningServices: activeServices?.length ?? 0,
        pendingServices: pendingRequests?.length ?? 0,
        avgUptime: null,
        deployedServices,
        publishedBlueprints,
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
  const resolvedNetwork = useResolvedEnvioNetwork(network);

  const query = useQuery({
    queryKey: [
      'envio',
      'services',
      'byId',
      serviceId?.toString(),
      resolvedNetwork,
    ],
    queryFn: async () => {
      if (serviceId === undefined) return null;
      const services = await fetchServices(
        { serviceId, limit: 1 },
        resolvedNetwork,
      );
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
  const resolvedNetwork = useResolvedEnvioNetwork(network);

  return useQuery({
    queryKey: [
      'envio',
      'services',
      'all',
      status,
      blueprintId?.toString(),
      limit,
      offset,
      resolvedNetwork,
    ],
    queryFn: async () => {
      return fetchServices(
        { status, blueprintId, limit, offset },
        resolvedNetwork,
      );
    },
    enabled,
    staleTime: 30_000,
  });
};

/**
 * Hook to batch-fetch membership models for a list of service IDs via multicall.
 * Returns a Map from serviceId string to MembershipModel.
 */
export const useActiveServiceMemberships = (
  serviceIds: bigint[],
  options?: { enabled?: boolean },
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

  const sortedServiceIds = useMemo(
    () => [...serviceIds].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    [serviceIds],
  );

  const tangleAddress = contracts?.tangle;
  const isReady =
    !!publicClient &&
    !!tangleAddress &&
    tangleAddress !== zeroAddress &&
    sortedServiceIds.length > 0;

  return useQuery({
    queryKey: [
      'serviceMemberships',
      chainId,
      ...sortedServiceIds.map((id) => id.toString()),
    ],
    queryFn: async (): Promise<Map<string, MembershipModel>> => {
      if (!publicClient || !tangleAddress || tangleAddress === zeroAddress) {
        return new Map();
      }

      const results = await publicClient.multicall({
        contracts: sortedServiceIds.map((serviceId) => ({
          address: tangleAddress,
          abi: TangleABI,
          functionName: 'getService' as const,
          args: [serviceId],
        })),
        allowFailure: true,
      });

      const memberships = new Map<string, MembershipModel>();

      for (let i = 0; i < sortedServiceIds.length; i++) {
        const result = results[i];
        if (result.status === 'success' && result.result) {
          const service = result.result as {
            membership: number;
          };
          memberships.set(
            sortedServiceIds[i].toString(),
            service.membership as MembershipModel,
          );
        }
      }

      return memberships;
    },
    enabled: enabled && isReady,
    staleTime: 60_000,
  });
};

export default useServicesByOwner;

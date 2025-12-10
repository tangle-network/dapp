/**
 * Hooks for fetching service/instance data from the Envio indexer.
 */

import { useQuery } from '@tanstack/react-query';
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
  permittedCallers: Address[];
  ttl: bigint;
  createdAt: bigint;
  updatedAt: bigint;
}

// Service request from indexer
export interface ServiceRequest {
  id: string;
  requestId: bigint;
  blueprintId: bigint;
  requester: Address;
  operators: Address[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: bigint;
}

// Raw response types
interface ServiceQueryResponse {
  Service: Array<{
    id: string;
    serviceId: string;
    blueprintId: string;
    owner: string;
    status: string;
    operators: string[];
    permittedCallers: string[];
    ttl: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface ServiceRequestQueryResponse {
  ServiceRequest: Array<{
    id: string;
    requestId: string;
    blueprintId: string;
    requester: string;
    operators: string[];
    status: string;
    createdAt: string;
  }>;
}

// Fetch services from GraphQL
const fetchServices = async (
  options: {
    owner?: Address;
    operator?: Address;
    status?: ServiceStatus;
    blueprintId?: bigint;
    limit?: number;
    offset?: number;
  },
  network?: EnvioNetwork,
): Promise<Service[]> => {
  const where: string[] = [];
  if (options.owner) {
    where.push(`owner: { _eq: "${options.owner}" }`);
  }
  if (options.operator) {
    where.push(`operators: { _contains: ["${options.operator}"] }`);
  }
  if (options.status) {
    where.push(`status: { _eq: "${options.status}" }`);
  }
  if (options.blueprintId !== undefined) {
    where.push(`blueprintId: { _eq: "${options.blueprintId}" }`);
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
        blueprintId
        owner
        status
        operators
        permittedCallers
        ttl
        createdAt
        updatedAt
      }
    }
  `;

  const result = await executeEnvioGraphQL<ServiceQueryResponse, {
    limit: number;
    offset: number;
  }>(query, { limit: options.limit ?? 100, offset: options.offset ?? 0 }, network);

  if (result.errors?.length) {
    console.error('GraphQL errors:', result.errors);
  }

  return (result.data.Service ?? []).map((s) => ({
    id: s.id,
    serviceId: BigInt(s.serviceId),
    blueprintId: BigInt(s.blueprintId),
    owner: s.owner as Address,
    status: s.status as ServiceStatus,
    operators: s.operators as Address[],
    permittedCallers: s.permittedCallers as Address[],
    ttl: BigInt(s.ttl),
    createdAt: BigInt(s.createdAt),
    updatedAt: BigInt(s.updatedAt),
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
    where.push(`requester: { _eq: "${options.requester}" }`);
  }
  if (options.operator) {
    where.push(`operators: { _contains: ["${options.operator}"] }`);
  }
  if (options.status) {
    where.push(`status: { _eq: "${options.status}" }`);
  }
  if (options.blueprintId !== undefined) {
    where.push(`blueprintId: { _eq: "${options.blueprintId}" }`);
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
        blueprintId
        requester
        operators
        status
        createdAt
      }
    }
  `;

  const result = await executeEnvioGraphQL<ServiceRequestQueryResponse, {
    limit: number;
    offset: number;
  }>(query, { limit: options.limit ?? 100, offset: options.offset ?? 0 }, network);

  if (result.errors?.length) {
    console.error('GraphQL errors:', result.errors);
  }

  return (result.data.ServiceRequest ?? []).map((r) => ({
    id: r.id,
    requestId: BigInt(r.requestId),
    blueprintId: BigInt(r.blueprintId),
    requester: r.requester as Address,
    operators: r.operators as Address[],
    status: r.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    createdAt: BigInt(r.createdAt),
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
    queryKey: ['envio', 'operatorStats', operator, network],
    queryFn: async () => {
      if (!operator) return null;

      // Query blueprint registrations
      const blueprintQuery = `
        query GetOperatorBlueprints($operator: String!) {
          OperatorBlueprint(where: { operatorId: { _eq: $operator } }) {
            id
            blueprintId
          }
        }
      `;

      const blueprintResult = await executeEnvioGraphQL<{
        OperatorBlueprint: Array<{ id: string; blueprintId: string }>;
      }, { operator: string }>(blueprintQuery, { operator }, network);

      return {
        registeredBlueprints: blueprintResult.data.OperatorBlueprint?.length ?? 0,
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

export default useServicesByOwner;

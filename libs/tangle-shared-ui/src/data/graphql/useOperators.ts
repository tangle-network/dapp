/**
 * Hook to fetch operators from the Envio indexer.
 * Replaces the Substrate-based useRestakeOperatorMap hook.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';

// Operator status enum matching the Envio schema
export type RestakingOperatorStatus = 'ACTIVE' | 'LEAVING' | 'INACTIVE';

// Operator type from the indexer
export interface Operator {
  id: string;
  ecdsaPublicKey: string | null;
  rpcAddress: string | null;
  createdAt: bigint | null;
  updatedAt: bigint | null;
  restakingStatus: RestakingOperatorStatus | null;
  restakingStake: bigint | null;
  restakingDelegationCount: bigint | null;
  restakingLeavingRound: bigint | null;
  restakingScheduledUnstakeAmount: bigint | null;
  restakingScheduledUnstakeRound: bigint | null;
}

// Query to fetch operators with status filter (Hasura uses PascalCase table names)
// Note: restakingoperatorstatus is the Hasura enum type (lowercase)
const OPERATORS_WITH_STATUS_QUERY = gql`
  query OperatorsWithStatus(
    $limit: Int
    $offset: Int
    $status: restakingoperatorstatus!
  ) {
    Operator(
      limit: $limit
      offset: $offset
      where: { restakingStatus: { _eq: $status } }
      order_by: { restakingStake: desc }
    ) {
      id
      ecdsaPublicKey
      rpcAddress
      createdAt
      updatedAt
      restakingStatus
      restakingStake
      restakingDelegationCount
      restakingLeavingRound
      restakingScheduledUnstakeAmount
      restakingScheduledUnstakeRound
    }
  }
`;

// Query to fetch all operators without status filter
const OPERATORS_QUERY = gql`
  query Operators($limit: Int, $offset: Int) {
    Operator(
      limit: $limit
      offset: $offset
      order_by: { restakingStake: desc }
    ) {
      id
      ecdsaPublicKey
      rpcAddress
      createdAt
      updatedAt
      restakingStatus
      restakingStake
      restakingDelegationCount
      restakingLeavingRound
      restakingScheduledUnstakeAmount
      restakingScheduledUnstakeRound
    }
  }
`;

interface OperatorsQueryResult {
  Operator: Array<{
    id: string;
    ecdsaPublicKey: string | null;
    rpcAddress: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    restakingStatus: RestakingOperatorStatus | null;
    restakingStake: string | null;
    restakingDelegationCount: string | null;
    restakingLeavingRound: string | null;
    restakingScheduledUnstakeAmount: string | null;
    restakingScheduledUnstakeRound: string | null;
  }>;
}

// Parse operator data from GraphQL response
const parseOperator = (
  raw: OperatorsQueryResult['Operator'][number],
): Operator => ({
  id: raw.id,
  ecdsaPublicKey: raw.ecdsaPublicKey,
  rpcAddress: raw.rpcAddress,
  createdAt: raw.createdAt ? BigInt(raw.createdAt) : null,
  updatedAt: raw.updatedAt ? BigInt(raw.updatedAt) : null,
  restakingStatus: raw.restakingStatus,
  restakingStake: raw.restakingStake ? BigInt(raw.restakingStake) : null,
  restakingDelegationCount: raw.restakingDelegationCount
    ? BigInt(raw.restakingDelegationCount)
    : null,
  restakingLeavingRound: raw.restakingLeavingRound
    ? BigInt(raw.restakingLeavingRound)
    : null,
  restakingScheduledUnstakeAmount: raw.restakingScheduledUnstakeAmount
    ? BigInt(raw.restakingScheduledUnstakeAmount)
    : null,
  restakingScheduledUnstakeRound: raw.restakingScheduledUnstakeRound
    ? BigInt(raw.restakingScheduledUnstakeRound)
    : null,
});

// Fetch operators from the indexer
const fetchOperators = async (
  network?: EnvioNetwork,
  status?: RestakingOperatorStatus,
  limit?: number,
  offset?: number,
): Promise<Operator[]> => {
  // Use the appropriate query based on whether status is provided
  // Hasura's enum type doesn't accept null values, so we need separate queries
  if (status !== undefined) {
    const result = await executeEnvioGraphQL<
      OperatorsQueryResult,
      {
        limit?: number;
        offset?: number;
        status: string;
      }
    >(OPERATORS_WITH_STATUS_QUERY, { limit, offset, status }, network);

    return (result.data.Operator ?? []).map(parseOperator);
  }

  const result = await executeEnvioGraphQL<
    OperatorsQueryResult,
    {
      limit?: number;
      offset?: number;
    }
  >(OPERATORS_QUERY, { limit, offset }, network);

  return (result.data.Operator ?? []).map(parseOperator);
};

// Hook to fetch all operators
export const useOperators = (options?: {
  network?: EnvioNetwork;
  status?: RestakingOperatorStatus;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) => {
  const {
    network,
    status,
    limit = 100,
    offset = 0,
    enabled = true,
  } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'operators', network, status, limit, offset],
    queryFn: () => fetchOperators(network, status, limit, offset),
    enabled,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
};

// Hook to fetch operators as a map (keyed by address)
export const useOperatorMap = (options?: {
  network?: EnvioNetwork;
  status?: RestakingOperatorStatus;
  enabled?: boolean;
}) => {
  const { network, status, enabled = true } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'operatorMap', network, status],
    queryFn: async () => {
      // Use limit/offset for Hasura pagination
      const operators = await fetchOperators(network, status, 1000, 0);
      const map = new Map<Address, Operator>();
      for (const op of operators) {
        map.set(op.id as Address, op);
      }
      return map;
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
};

// Hook to fetch a single operator by address (Hasura uses _by_pk for single row queries)
export const useOperator = (
  address: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { network, enabled = true } = options ?? {};

  const OPERATOR_QUERY = gql`
    query Operator($id: String!) {
      Operator_by_pk(id: $id) {
        id
        ecdsaPublicKey
        rpcAddress
        createdAt
        updatedAt
        restakingStatus
        restakingStake
        restakingDelegationCount
        restakingLeavingRound
        restakingScheduledUnstakeAmount
        restakingScheduledUnstakeRound
      }
    }
  `;

  return useQuery({
    queryKey: ['envio', 'operator', address, network],
    queryFn: async () => {
      if (!address) return null;
      const result = await executeEnvioGraphQL<
        { Operator_by_pk: OperatorsQueryResult['Operator'][number] | null },
        { id: string }
      >(OPERATOR_QUERY, { id: address.toLowerCase() }, network);

      return result.data.Operator_by_pk
        ? parseOperator(result.data.Operator_by_pk)
        : null;
    },
    enabled: enabled && !!address,
    staleTime: 30_000,
  });
};

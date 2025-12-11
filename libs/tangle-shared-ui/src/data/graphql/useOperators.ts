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

// Query to fetch all active operators
const OPERATORS_QUERY = gql`
  query Operators($first: Int, $skip: Int, $status: RestakingOperatorStatus) {
    operators(
      first: $first
      skip: $skip
      where: { restakingStatus: $status }
      orderBy: restakingStake
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
  operators: Array<{
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
  raw: OperatorsQueryResult['operators'][number],
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
  first?: number,
  skip?: number,
): Promise<Operator[]> => {
  const result = await executeEnvioGraphQL<
    OperatorsQueryResult,
    {
      first?: number;
      skip?: number;
      status?: RestakingOperatorStatus;
    }
  >(OPERATORS_QUERY, { first, skip, status }, network);

  return result.data.operators.map(parseOperator);
};

// Hook to fetch all operators
export const useOperators = (options?: {
  network?: EnvioNetwork;
  status?: RestakingOperatorStatus;
  first?: number;
  skip?: number;
  enabled?: boolean;
}) => {
  const {
    network,
    status,
    first = 100,
    skip = 0,
    enabled = true,
  } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'operators', network, status, first, skip],
    queryFn: () => fetchOperators(network, status, first, skip),
    enabled,
    staleTime: 30_000, // 30 seconds
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
      const operators = await fetchOperators(network, status, 1000, 0);
      const map = new Map<Address, Operator>();
      for (const op of operators) {
        map.set(op.id as Address, op);
      }
      return map;
    },
    enabled,
    staleTime: 30_000,
  });
};

// Hook to fetch a single operator by address
export const useOperator = (
  address: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { network, enabled = true } = options ?? {};

  const OPERATOR_QUERY = gql`
    query Operator($id: ID!) {
      operator(id: $id) {
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
        { operator: OperatorsQueryResult['operators'][number] | null },
        { id: string }
      >(OPERATOR_QUERY, { id: address.toLowerCase() }, network);

      return result.data.operator ? parseOperator(result.data.operator) : null;
    },
    enabled: enabled && !!address,
    staleTime: 30_000,
  });
};

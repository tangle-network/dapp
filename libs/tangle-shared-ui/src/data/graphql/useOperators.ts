/**
 * Hook to fetch operators from the Envio indexer.
 * Replaces the Substrate-based useRestakeOperatorMap hook.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import useNetworkStore from '../../context/useNetworkStore';

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
  /** Delegation mode: 0=Disabled, 1=Whitelist, 2=Open. Null is treated as 0 (Disabled). */
  delegationMode: number | null;
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
      delegationMode
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
      delegationMode
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
    delegationMode: number | null;
  }>;
}

// Safely parse a string to BigInt, returning null on invalid input
const safeBigInt = (value: string | null): bigint | null => {
  if (!value) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
};

// Parse operator data from GraphQL response
const parseOperator = (
  raw: OperatorsQueryResult['Operator'][number],
): Operator => ({
  id: raw.id,
  ecdsaPublicKey: raw.ecdsaPublicKey,
  rpcAddress: raw.rpcAddress,
  createdAt: safeBigInt(raw.createdAt),
  updatedAt: safeBigInt(raw.updatedAt),
  restakingStatus: raw.restakingStatus,
  restakingStake: safeBigInt(raw.restakingStake),
  restakingDelegationCount: safeBigInt(raw.restakingDelegationCount),
  restakingLeavingRound: safeBigInt(raw.restakingLeavingRound),
  restakingScheduledUnstakeAmount: safeBigInt(raw.restakingScheduledUnstakeAmount),
  restakingScheduledUnstakeRound: safeBigInt(raw.restakingScheduledUnstakeRound),
  delegationMode: raw.delegationMode,
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
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);

  return useQuery({
    queryKey: ['envio', 'operators', resolvedNetwork, status, limit, offset],
    queryFn: () => fetchOperators(resolvedNetwork, status, limit, offset),
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
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);

  return useQuery({
    queryKey: ['envio', 'operatorMap', resolvedNetwork, status],
    queryFn: async () => {
      // Use limit/offset for Hasura pagination
      const operators = await fetchOperators(resolvedNetwork, status, 1000, 0);
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
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);

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
        delegationMode
      }
    }
  `;

  return useQuery({
    queryKey: ['envio', 'operator', address, resolvedNetwork],
    queryFn: async () => {
      if (!address) return null;
      const result = await executeEnvioGraphQL<
        { Operator_by_pk: OperatorsQueryResult['Operator'][number] | null },
        { id: string }
      >(OPERATOR_QUERY, { id: address.toLowerCase() }, resolvedNetwork);

      return result.data.Operator_by_pk
        ? parseOperator(result.data.Operator_by_pk)
        : null;
    },
    enabled: enabled && !!address,
    staleTime: 30_000,
  });
};

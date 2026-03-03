/**
 * Hook to fetch operators from the Envio indexer.
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

export type StakingOperatorStatus = 'ACTIVE' | 'LEAVING' | 'INACTIVE';

export interface Operator {
  id: string;
  ecdsaPublicKey: string | null;
  rpcAddress: string | null;
  createdAt: bigint | null;
  updatedAt: bigint | null;
  stakingStatus: StakingOperatorStatus | null;
  stakingStake: bigint | null;
  stakingDelegationCount: bigint | null;
  stakingLeavingRound: bigint | null;
  stakingScheduledUnstakeAmount: bigint | null;
  stakingScheduledUnstakeRound: bigint | null;
  /** Delegation mode: 0=Disabled, 1=Whitelist, 2=Open. Null is treated as 0 (Disabled). */
  delegationMode: number | null;
}

const OPERATORS_WITH_STATUS_QUERY = gql`
  query OperatorsWithStatus(
    $limit: Int
    $offset: Int
    $status: stakingoperatorstatus!
  ) {
    Operator(
      limit: $limit
      offset: $offset
      where: { stakingStatus: { _eq: $status } }
      order_by: { stakingStake: desc }
    ) {
      id
      ecdsaPublicKey
      rpcAddress
      createdAt
      updatedAt
      stakingStatus
      stakingStake
      stakingDelegationCount
      stakingLeavingRound
      stakingScheduledUnstakeAmount
      stakingScheduledUnstakeRound
      delegationMode
    }
  }
`;

const OPERATORS_QUERY = gql`
  query Operators($limit: Int, $offset: Int) {
    Operator(limit: $limit, offset: $offset, order_by: { stakingStake: desc }) {
      id
      ecdsaPublicKey
      rpcAddress
      createdAt
      updatedAt
      stakingStatus
      stakingStake
      stakingDelegationCount
      stakingLeavingRound
      stakingScheduledUnstakeAmount
      stakingScheduledUnstakeRound
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
    stakingStatus: StakingOperatorStatus | null;
    stakingStake: string | null;
    stakingDelegationCount: string | null;
    stakingLeavingRound: string | null;
    stakingScheduledUnstakeAmount: string | null;
    stakingScheduledUnstakeRound: string | null;
    delegationMode: number | null;
  }>;
}

const safeBigInt = (value: string | null): bigint | null => {
  if (!value) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
};

const parseOperator = (
  raw: OperatorsQueryResult['Operator'][number],
): Operator => ({
  id: raw.id,
  ecdsaPublicKey: raw.ecdsaPublicKey,
  rpcAddress: raw.rpcAddress,
  createdAt: safeBigInt(raw.createdAt),
  updatedAt: safeBigInt(raw.updatedAt),
  stakingStatus: raw.stakingStatus,
  stakingStake: safeBigInt(raw.stakingStake),
  stakingDelegationCount: safeBigInt(raw.stakingDelegationCount),
  stakingLeavingRound: safeBigInt(raw.stakingLeavingRound),
  stakingScheduledUnstakeAmount: safeBigInt(raw.stakingScheduledUnstakeAmount),
  stakingScheduledUnstakeRound: safeBigInt(raw.stakingScheduledUnstakeRound),
  delegationMode: raw.delegationMode,
});

const fetchOperators = async (
  network?: EnvioNetwork,
  status?: StakingOperatorStatus,
  limit?: number,
  offset?: number,
): Promise<Operator[]> => {
  if (status !== undefined) {
    const result = await executeEnvioGraphQL<
      OperatorsQueryResult,
      {
        limit?: number;
        offset?: number;
        status: StakingOperatorStatus;
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

export const useOperators = (options?: {
  network?: EnvioNetwork;
  status?: StakingOperatorStatus;
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
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
};

export const useOperatorMap = (options?: {
  network?: EnvioNetwork;
  status?: StakingOperatorStatus;
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
        stakingStatus
        stakingStake
        stakingDelegationCount
        stakingLeavingRound
        stakingScheduledUnstakeAmount
        stakingScheduledUnstakeRound
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

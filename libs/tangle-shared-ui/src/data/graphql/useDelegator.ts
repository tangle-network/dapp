/**
 * Hook to fetch delegator data from the Envio indexer.
 * Replaces the Substrate-based useRestakeDelegatorInfo hook.
 * Returns null if the indexer is unavailable.
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
import { useEnvioHealthCheckByChainId } from '../../utils/checkEnvioHealth';
import useNetworkStore from '../../context/useNetworkStore';

// Request status enum
export type RequestStatus = 'PENDING' | 'READY' | 'EXECUTED' | 'CANCELLED';

// Lock duration enum
export type LockDuration =
  | 'NONE'
  | 'ONE_MONTH'
  | 'TWO_MONTHS'
  | 'THREE_MONTHS'
  | 'SIX_MONTHS';

// Blueprint selection mode
export type BlueprintSelectionMode = 'ALL' | 'FIXED';

// Delegator asset position
export interface DelegatorAssetPosition {
  id: string;
  token: Address;
  totalDeposited: bigint;
  delegatedAmount: bigint;
  lockedAmount: bigint;
  lastUpdatedAt: bigint;
}

// Delegation position (per-operator)
export interface DelegationPosition {
  id: string;
  operatorId: Address;
  token: Address;
  shares: bigint;
  lastKnownAmount: bigint;
  blueprintSelection: BlueprintSelectionMode;
  blueprintIds: bigint[];
  createdAtRound: bigint;
  updatedAtRound: bigint;
}

// Withdraw request
export interface WithdrawRequest {
  id: string;
  token: Address;
  nonce: bigint;
  amount: bigint;
  requestedRound: bigint;
  readyAtRound: bigint;
  status: RequestStatus;
  executedAt: bigint | null;
}

// Unstake request
export interface UnstakeRequest {
  id: string;
  operatorId: Address;
  token: Address;
  nonce: bigint;
  shares: bigint;
  estimatedAmount: bigint;
  requestedRound: bigint;
  readyAtRound: bigint;
  status: RequestStatus;
  executedAt: bigint | null;
}

// Full delegator info
export interface Delegator {
  id: string;
  address: Address;
  totalDeposited: bigint;
  totalDelegated: bigint;
  createdAt: bigint;
  updatedAt: bigint;
  withdrawNonce: bigint;
  unstakeNonce: bigint;
  assetPositions: DelegatorAssetPosition[];
  delegations: DelegationPosition[];
  withdrawRequests: WithdrawRequest[];
  unstakeRequests: UnstakeRequest[];
}

// GraphQL query for delegator (Hasura uses _by_pk for single row queries)
const DELEGATOR_QUERY = gql`
  query Delegator($id: String!) {
    Delegator_by_pk(id: $id) {
      id
      address
      totalDeposited
      totalDelegated
      createdAt
      updatedAt
      withdrawNonce
      withdrawCursor
      unstakeNonce
      unstakeCursor
      assetPositions {
        id
        token
        totalDeposited
        delegatedAmount
        lockedAmount
        lastUpdatedAt
      }
      delegations {
        id
        operator {
          id
        }
        token
        shares
        lastKnownAmount
        blueprintSelection
        blueprintIds
        createdAtRound
        updatedAtRound
      }
      withdrawRequests(where: { status: { _eq: "PENDING" } }) {
        id
        token
        nonce
        amount
        requestedRound
        readyAtRound
        status
        executedAt
      }
      unstakeRequests(where: { status: { _eq: "PENDING" } }) {
        id
        operator {
          id
        }
        token
        nonce
        shares
        estimatedAmount
        requestedRound
        readyAtRound
        status
        executedAt
      }
    }
  }
`;

interface DelegatorQueryResult {
  Delegator_by_pk: {
    id: string;
    address: string;
    totalDeposited: string;
    totalDelegated: string;
    createdAt: string;
    updatedAt: string;
    withdrawNonce: string;
    unstakeNonce: string;
    assetPositions: Array<{
      id: string;
      token: string;
      totalDeposited: string;
      delegatedAmount: string;
      lockedAmount: string;
      lastUpdatedAt: string;
    }>;
    delegations: Array<{
      id: string;
      operator: { id: string };
      token: string;
      shares: string;
      lastKnownAmount: string;
      blueprintSelection: BlueprintSelectionMode;
      blueprintIds: string[] | null;
      createdAtRound: string;
      updatedAtRound: string;
    }>;
    withdrawRequests: Array<{
      id: string;
      token: string;
      nonce: string;
      amount: string;
      requestedRound: string;
      readyAtRound: string;
      status: RequestStatus;
      executedAt: string | null;
    }>;
    unstakeRequests: Array<{
      id: string;
      operator: { id: string };
      token: string;
      nonce: string;
      shares: string;
      estimatedAmount: string;
      requestedRound: string;
      readyAtRound: string;
      status: RequestStatus;
      executedAt: string | null;
    }>;
  } | null;
}

// Parse delegator from GraphQL response
const parseDelegator = (
  raw: NonNullable<DelegatorQueryResult['Delegator_by_pk']>,
): Delegator => ({
  id: raw.id,
  address: raw.address as Address,
  totalDeposited: BigInt(raw.totalDeposited),
  totalDelegated: BigInt(raw.totalDelegated),
  createdAt: BigInt(raw.createdAt),
  updatedAt: BigInt(raw.updatedAt),
  withdrawNonce: BigInt(raw.withdrawNonce),
  unstakeNonce: BigInt(raw.unstakeNonce),
  assetPositions: raw.assetPositions.map((pos) => ({
    id: pos.id,
    token: pos.token as Address,
    totalDeposited: BigInt(pos.totalDeposited),
    delegatedAmount: BigInt(pos.delegatedAmount),
    lockedAmount: BigInt(pos.lockedAmount),
    lastUpdatedAt: BigInt(pos.lastUpdatedAt),
  })),
  delegations: raw.delegations.map((del) => ({
    id: del.id,
    operatorId: del.operator.id as Address,
    token: del.token as Address,
    shares: BigInt(del.shares),
    lastKnownAmount: BigInt(del.lastKnownAmount),
    blueprintSelection: del.blueprintSelection,
    blueprintIds: del.blueprintIds
      ? del.blueprintIds.map((id) => BigInt(id))
      : [],
    createdAtRound: BigInt(del.createdAtRound),
    updatedAtRound: BigInt(del.updatedAtRound),
  })),
  withdrawRequests: raw.withdrawRequests.map((req) => ({
    id: req.id,
    token: req.token as Address,
    nonce: BigInt(req.nonce),
    amount: BigInt(req.amount),
    requestedRound: BigInt(req.requestedRound),
    readyAtRound: BigInt(req.readyAtRound),
    status: req.status,
    executedAt: req.executedAt ? BigInt(req.executedAt) : null,
  })),
  unstakeRequests: raw.unstakeRequests.map((req) => ({
    id: req.id,
    operatorId: req.operator.id as Address,
    token: req.token as Address,
    nonce: BigInt(req.nonce),
    shares: BigInt(req.shares),
    estimatedAmount: BigInt(req.estimatedAmount),
    requestedRound: BigInt(req.requestedRound),
    readyAtRound: BigInt(req.readyAtRound),
    status: req.status,
    executedAt: req.executedAt ? BigInt(req.executedAt) : null,
  })),
});

// Hook to fetch delegator info by address
// Only queries GraphQL if the indexer is healthy, otherwise returns null
export const useDelegator = (
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

  // Check if indexer is healthy before querying
  const { data: isIndexerHealthy, isLoading: isCheckingHealth } =
    useEnvioHealthCheckByChainId(activeChainId);

  const healthCheckComplete = !isCheckingHealth;
  const shouldQuery = healthCheckComplete && isIndexerHealthy === true;

  const queryResult = useQuery({
    queryKey: ['envio', 'delegator', address, resolvedNetwork],
    queryFn: async () => {
      if (!address) return null;
      const result = await executeEnvioGraphQL<
        DelegatorQueryResult,
        { id: string }
      >(DELEGATOR_QUERY, { id: address.toLowerCase() }, resolvedNetwork);
      return result.data.Delegator_by_pk
        ? parseDelegator(result.data.Delegator_by_pk)
        : null;
    },
    // Only query if indexer is healthy
    enabled: enabled && !!address && shouldQuery,
    staleTime: 15_000, // 15 seconds - delegator data changes more frequently
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    retry: 2, // Reduce retries since we already check health
  });

  // If indexer is unhealthy, return null without loading state
  if (healthCheckComplete && !isIndexerHealthy) {
    return {
      ...queryResult,
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  // Still checking health
  if (isCheckingHealth) {
    return {
      ...queryResult,
      data: undefined,
      isLoading: true,
    };
  }

  return queryResult;
};

// Hook to get delegator's deposits (asset positions)
export const useDelegatorDeposits = (
  address: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { data: delegator, ...rest } = useDelegator(address, options);

  return {
    ...rest,
    data: delegator?.assetPositions ?? null,
  };
};

// Hook to get delegator's delegations
export const useDelegatorDelegations = (
  address: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { data: delegator, ...rest } = useDelegator(address, options);

  return {
    ...rest,
    data: delegator?.delegations ?? null,
  };
};

// Hook to get delegator's pending withdraw requests
export const useDelegatorWithdrawRequests = (
  address: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { data: delegator, ...rest } = useDelegator(address, options);

  return {
    ...rest,
    data: delegator?.withdrawRequests ?? null,
  };
};

// Hook to get delegator's pending unstake requests
export const useDelegatorUnstakeRequests = (
  address: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { data: delegator, ...rest } = useDelegator(address, options);

  return {
    ...rest,
    data: delegator?.unstakeRequests ?? null,
  };
};

// Query to count all delegators (restakers)
const DELEGATOR_COUNT_QUERY = gql`
  query DelegatorCount {
    Delegator {
      id
    }
  }
`;

interface DelegatorCountQueryResult {
  Delegator: Array<{ id: string }>;
}

// Hook to get the total count of unique restakers (delegators)
export const useDelegatorCount = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);

  return useQuery({
    queryKey: ['envio', 'delegatorCount', resolvedNetwork],
    queryFn: async () => {
      const result = await executeEnvioGraphQL<
        DelegatorCountQueryResult,
        Record<string, never>
      >(DELEGATOR_COUNT_QUERY, {}, resolvedNetwork);
      return result.data.Delegator?.length ?? 0;
    },
    enabled,
    staleTime: 30_000, // 30 seconds
  });
};

/**
 * Hook to fetch operators from the Envio indexer.
 */

import { useQuery } from '@tanstack/react-query';
import {
  Address,
  decodeFunctionResult,
  encodeFunctionData,
  type PublicClient,
  zeroAddress,
} from 'viem';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import useNetworkStore from '../../context/useNetworkStore';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';

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

const safeUnknownBigInt = (value: unknown): bigint | null => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return BigInt(Math.trunc(value));
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    try {
      return BigInt(value);
    } catch {
      return null;
    }
  }
  return null;
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

const toOperatorStatus = (
  status: number | bigint | null | undefined,
): StakingOperatorStatus | null => {
  if (status === null || status === undefined) return null;
  const value = Number(status);
  if (value === 0) return 'ACTIVE';
  if (value === 1) return 'INACTIVE';
  if (value === 2) return 'LEAVING';
  return null;
};

const parseOnChainMetadata = (
  metadata: unknown,
): {
  stake: bigint;
  delegationCount: bigint;
  status: StakingOperatorStatus | null;
  leavingRound: bigint;
} | null => {
  if (metadata === null || metadata === undefined) {
    return null;
  }

  if (Array.isArray(metadata)) {
    const [stake, delegationCount, status, leavingRound] = metadata;
    return {
      stake: safeUnknownBigInt(stake) ?? BigInt(0),
      delegationCount: safeUnknownBigInt(delegationCount) ?? BigInt(0),
      status: toOperatorStatus(
        typeof status === 'bigint' || typeof status === 'number'
          ? status
          : null,
      ),
      leavingRound: safeUnknownBigInt(leavingRound) ?? BigInt(0),
    };
  }

  if (typeof metadata === 'object') {
    const value = metadata as Record<string, unknown>;
    return {
      stake: safeUnknownBigInt(value.stake) ?? BigInt(0),
      delegationCount: safeUnknownBigInt(value.delegationCount) ?? BigInt(0),
      status: toOperatorStatus(
        typeof value.status === 'bigint' || typeof value.status === 'number'
          ? value.status
          : null,
      ),
      leavingRound: safeUnknownBigInt(value.leavingRound) ?? BigInt(0),
    };
  }

  return null;
};

const buildOnChainOperator = (
  address: Address,
  metadata: {
    stake: bigint;
    delegationCount: bigint;
    status: StakingOperatorStatus | null;
    leavingRound: bigint;
  } | null,
  delegationMode: number | bigint | null | undefined,
): Operator => {
  return {
    id: address.toLowerCase(),
    ecdsaPublicKey: null,
    rpcAddress: null,
    createdAt: null,
    updatedAt: null,
    stakingStatus: metadata?.status ?? null,
    stakingStake: metadata?.stake ?? null,
    stakingDelegationCount: metadata?.delegationCount ?? null,
    stakingLeavingRound: metadata?.leavingRound ?? null,
    stakingScheduledUnstakeAmount: null,
    stakingScheduledUnstakeRound: null,
    delegationMode:
      typeof delegationMode === 'bigint' || typeof delegationMode === 'number'
        ? Number(delegationMode)
        : null,
  };
};

const getDelegationContractAddress = (chainId: number): Address | null => {
  let contracts: ReturnType<typeof getContractsByChainId>;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    return null;
  }

  const contractAddress = contracts.multiAssetDelegation as Address;
  if (!contractAddress || contractAddress.toLowerCase() === zeroAddress) {
    return null;
  }

  return contractAddress;
};

const hydrateOnChainOperator = async (params: {
  publicClient: PublicClient;
  contractAddress: Address;
  operatorAddress: Address;
}): Promise<Operator> => {
  const { publicClient, contractAddress, operatorAddress } = params;
  const [metadataResult, modeResult] = await Promise.allSettled([
    readDelegationView<
      readonly [bigint, bigint, bigint, bigint],
      'getOperatorMetadata'
    >(publicClient, contractAddress, 'getOperatorMetadata', [operatorAddress]),
    readDelegationView<bigint, 'getDelegationMode'>(
      publicClient,
      contractAddress,
      'getDelegationMode',
      [operatorAddress],
    ),
  ]);

  const metadata =
    metadataResult.status === 'fulfilled'
      ? parseOnChainMetadata(metadataResult.value)
      : null;
  const delegationMode =
    modeResult.status === 'fulfilled' ? modeResult.value : null;

  return buildOnChainOperator(operatorAddress, metadata, delegationMode);
};

const fetchOnChainOperatorByAddress = async (params: {
  publicClient: PublicClient;
  chainId: number;
  operatorAddress: Address;
}): Promise<Operator | null> => {
  const { publicClient, chainId, operatorAddress } = params;
  const contractAddress = getDelegationContractAddress(chainId);
  if (!contractAddress) {
    return null;
  }

  const isOperator = await readDelegationView(
    publicClient,
    contractAddress,
    'isOperator',
    [operatorAddress],
  );

  if (!isOperator) {
    return null;
  }

  return hydrateOnChainOperator({
    publicClient,
    contractAddress,
    operatorAddress,
  });
};

const fetchOnChainOperators = async (params: {
  publicClient: PublicClient;
  chainId: number;
  status?: StakingOperatorStatus;
  limit?: number;
  offset?: number;
}): Promise<Operator[]> => {
  const { publicClient, chainId, status, limit = 100, offset = 0 } = params;
  const contractAddress = getDelegationContractAddress(chainId);
  if (!contractAddress) {
    return [];
  }
  const normalizedLimit = Math.max(limit, 0);
  if (normalizedLimit === 0) {
    return [];
  }
  const normalizedOffset = Math.max(offset, 0);

  const totalOperators = Number(
    await readDelegationView(
      publicClient,
      contractAddress,
      'operatorCount',
      [],
    ),
  );

  if (!Number.isFinite(totalOperators) || totalOperators <= 0) {
    return [];
  }
  if (status === 'INACTIVE') {
    throw new Error(
      'On-chain operator fallback cannot enumerate full INACTIVE history without indexer data.',
    );
  }

  const indexes = Array.from({ length: totalOperators }, (_, i) => i);

  const operatorResults = await Promise.allSettled(
    indexes.map(async (index) => {
      const address = (await readDelegationView(
        publicClient,
        contractAddress,
        'operatorAt',
        [BigInt(index)],
      )) as Address;

      return hydrateOnChainOperator({
        publicClient,
        contractAddress,
        operatorAddress: address,
      });
    }),
  );
  const operators = operatorResults
    .filter(
      (
        result,
      ): result is PromiseFulfilledResult<
        Awaited<ReturnType<typeof hydrateOnChainOperator>>
      > => result.status === 'fulfilled',
    )
    .map((result) => result.value);

  if (process.env.NODE_ENV === 'development') {
    const rejectedCount = operatorResults.filter(
      (result) => result.status === 'rejected',
    ).length;
    if (rejectedCount > 0) {
      console.debug('[useOperators] On-chain operator hydration failures', {
        chainId,
        rejectedCount,
        total: operatorResults.length,
      });
    }
  }

  const filteredAndSorted =
    status === undefined
      ? operators
      : operators.filter((operator) => operator.stakingStatus === status);

  filteredAndSorted.sort((a, b) => {
    const aStake = a.stakingStake ?? BigInt(0);
    const bStake = b.stakingStake ?? BigInt(0);
    if (aStake === bStake) return 0;
    return aStake < bStake ? 1 : -1;
  });

  return filteredAndSorted.slice(
    normalizedOffset,
    normalizedOffset + normalizedLimit,
  );
};

const debugOperatorHook = (
  message: string,
  payload?: Record<string, unknown>,
) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  console.debug(`[useOperators] ${message}`, payload ?? {});
};

type DelegationViewFunctionName =
  | 'operatorCount'
  | 'operatorAt'
  | 'getOperatorMetadata'
  | 'getDelegationMode'
  | 'isOperator';

type DelegationViewArgsMap = {
  operatorCount: readonly [];
  operatorAt: readonly [bigint];
  getOperatorMetadata: readonly [Address];
  getDelegationMode: readonly [Address];
  isOperator: readonly [Address];
};

const readDelegationView = async <
  T,
  TFunctionName extends DelegationViewFunctionName,
>(
  publicClient: PublicClient,
  contractAddress: Address,
  functionName: TFunctionName,
  args: DelegationViewArgsMap[TFunctionName],
): Promise<T> => {
  const data = encodeFunctionData({
    abi: MULTI_ASSET_DELEGATION_ABI,
    functionName: functionName as any,
    args: args as any,
  });
  let returnData: `0x${string}` | undefined;
  try {
    const callResult = await publicClient.call({
      to: contractAddress,
      data,
    });
    returnData = callResult.data;
  } catch (primaryError) {
    const transport = publicClient.transport as {
      request?: (request: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
    };
    if (!transport.request) {
      throw primaryError;
    }

    const rawResult = await transport.request({
      method: 'eth_call',
      params: [{ to: contractAddress, data }, 'latest'],
    });
    if (typeof rawResult !== 'string') {
      throw primaryError;
    }
    returnData = rawResult as `0x${string}`;
  }

  if (!returnData) {
    throw new Error(`Empty call result for ${functionName}`);
  }

  const decode = decodeFunctionResult as (params: {
    abi: typeof MULTI_ASSET_DELEGATION_ABI;
    functionName: string;
    data: `0x${string}`;
  }) => unknown;

  return decode({
    abi: MULTI_ASSET_DELEGATION_ABI,
    functionName,
    data: returnData,
  }) as T;
};

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
  fallbackToOnChain?: boolean;
}) => {
  const {
    network,
    status,
    limit = 100,
    offset = 0,
    enabled = true,
    fallbackToOnChain = true,
  } = options ?? {};
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);
  const publicClient = usePublicClient({ chainId: activeChainId });

  return useQuery({
    queryKey: [
      'envio',
      'operators',
      resolvedNetwork,
      activeChainId,
      status,
      limit,
      offset,
    ],
    queryFn: async () => {
      try {
        const operators = await fetchOperators(
          resolvedNetwork,
          status,
          limit,
          offset,
        );
        if (
          fallbackToOnChain &&
          operators.length === 0 &&
          publicClient &&
          status !== 'INACTIVE'
        ) {
          try {
            const onChainOperators = await fetchOnChainOperators({
              publicClient,
              chainId: activeChainId,
              status,
              limit,
              offset,
            });
            if (onChainOperators.length > 0) {
              return onChainOperators;
            }
          } catch (error) {
            debugOperatorHook('On-chain fallback operators read failed', {
              chainId: activeChainId,
              status: status ?? 'ALL',
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
        return operators;
      } catch {
        if (!fallbackToOnChain || !publicClient) {
          throw new Error(
            'Operators unavailable: indexer query failed and no public client is configured.',
          );
        }
        return fetchOnChainOperators({
          publicClient,
          chainId: activeChainId,
          status,
          limit,
          offset,
        });
      }
    },
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
  const publicClient = usePublicClient({ chainId: activeChainId });

  return useQuery({
    queryKey: ['envio', 'operatorMap', resolvedNetwork, activeChainId, status],
    queryFn: async () => {
      let operators: Operator[];
      try {
        operators = await fetchOperators(resolvedNetwork, status, 1000, 0);
        debugOperatorHook('GraphQL operatorMap result', {
          chainId: activeChainId,
          status: status ?? 'ALL',
          count: operators.length,
        });
        if (operators.length === 0 && publicClient && status !== 'INACTIVE') {
          try {
            const onChainOperators = await fetchOnChainOperators({
              publicClient,
              chainId: activeChainId,
              status,
              limit: 1000,
              offset: 0,
            });
            debugOperatorHook('On-chain fallback operatorMap result', {
              chainId: activeChainId,
              status: status ?? 'ALL',
              count: onChainOperators.length,
            });
            if (onChainOperators.length > 0) {
              operators = onChainOperators;
            }
          } catch (error) {
            debugOperatorHook('On-chain fallback operatorMap read failed', {
              chainId: activeChainId,
              status: status ?? 'ALL',
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      } catch {
        debugOperatorHook(
          'GraphQL operatorMap failed, using on-chain fallback',
          {
            chainId: activeChainId,
            status: status ?? 'ALL',
          },
        );
        if (!publicClient) {
          throw new Error(
            'Operator map unavailable: indexer query failed and no public client is configured.',
          );
        }
        try {
          operators = await fetchOnChainOperators({
            publicClient,
            chainId: activeChainId,
            status,
            limit: 1000,
            offset: 0,
          });
        } catch (error) {
          debugOperatorHook('On-chain fallback operatorMap read failed', {
            chainId: activeChainId,
            status: status ?? 'ALL',
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
        debugOperatorHook('On-chain fallback operatorMap result after error', {
          chainId: activeChainId,
          status: status ?? 'ALL',
          count: operators.length,
        });
      }
      const map = new Map<Address, Operator>();
      for (const op of operators) {
        map.set(op.id.toLowerCase() as Address, op);
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
  const publicClient = usePublicClient({ chainId: activeChainId });

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
    queryKey: [
      'envio',
      'operator',
      address?.toLowerCase(),
      resolvedNetwork,
      activeChainId,
    ],
    queryFn: async () => {
      if (!address) return null;
      try {
        const result = await executeEnvioGraphQL<
          { Operator_by_pk: OperatorsQueryResult['Operator'][number] | null },
          { id: string }
        >(OPERATOR_QUERY, { id: address.toLowerCase() }, resolvedNetwork);

        return result.data.Operator_by_pk
          ? parseOperator(result.data.Operator_by_pk)
          : null;
      } catch {
        if (!publicClient) {
          throw new Error(
            'Operator unavailable: indexer query failed and no public client is configured.',
          );
        }

        return fetchOnChainOperatorByAddress({
          publicClient,
          chainId: activeChainId,
          operatorAddress: address,
        });
      }
    },
    enabled: enabled && !!address,
    staleTime: 30_000,
  });
};

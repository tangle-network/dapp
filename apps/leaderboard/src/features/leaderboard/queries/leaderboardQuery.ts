import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import {
  executeEnvioGraphQL,
  type EnvioNetwork,
} from '@tangle-network/tangle-shared-ui/utils/executeEnvioGraphQL';
import { useQuery } from '@tanstack/react-query';
import { LEADERBOARD_QUERY_KEY } from '../../../constants/query';
import { RoleFilterEnum } from '../constants';

const DEFAULT_EXCLUDED_ACCOUNT_IDS = [
  '0x0000000000000000000000000000000000000000',
] as const;

const parseExcludedLeaderboardAccountIds = (): string[] => {
  const configured = import.meta.env.VITE_LEADERBOARD_EXCLUDED_ACCOUNTS as
    | string
    | undefined;

  if (!configured || configured.trim().length === 0) {
    return [...DEFAULT_EXCLUDED_ACCOUNT_IDS];
  }

  const parsed = configured
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);

  if (parsed.length === 0) {
    return [...DEFAULT_EXCLUDED_ACCOUNT_IDS];
  }

  return [...new Set(parsed)];
};

const EXCLUDED_LEADERBOARD_ACCOUNT_IDS = parseExcludedLeaderboardAccountIds();
const EXCLUDED_LEADERBOARD_ACCOUNT_SET = new Set(
  EXCLUDED_LEADERBOARD_ACCOUNT_IDS,
);

const toEnvioNetwork = (network: NetworkType): EnvioNetwork => {
  return network === 'MAINNET' ? 'mainnet' : 'testnet';
};

const isAggregateFieldUnavailable = (
  errors?: Array<{ message: string }>,
): boolean => {
  if (!errors || errors.length === 0) {
    return false;
  }

  return errors.some((error) => {
    const message = error.message.toLowerCase();
    return (
      message.includes('cannot query field') && message.includes('_aggregate')
    );
  });
};

/**
 * PointsAccount node from Envio indexer
 */
export interface LeaderboardAccountNodeType {
  id: string;
  totalPoints: string;
  totalMainnetPoints: string;
  totalTestnetPoints: string;
  leaderboardPoints: string;
  updatedAt: string;
  snapshots: Array<{
    id: string;
    blockNumber: string;
    timestamp: string;
    totalPoints: string;
  }>;
}

/**
 * Delegator data for activity badges
 */
export interface DelegatorActivityData {
  id: string;
  totalDeposited: string;
  totalDelegated: string;
  assetPositions: Array<{
    id: string;
    token: string;
    totalDeposited: string;
  }>;
  delegations: Array<{
    id: string;
    operator: { id: string };
    token: string;
    shares: string;
  }>;
  liquidVaultPositions: Array<{
    id: string;
    shares: string;
  }>;
}

/**
 * Combined account data with activity information
 */
export interface LeaderboardAccountWithActivity
  extends LeaderboardAccountNodeType {
  delegator?: DelegatorActivityData;
  isOperator: boolean;
  blueprintCount: number;
  serviceCount: number;
  jobCallCount: number;
}

interface LeaderboardQueryResponse {
  PointsAccount: LeaderboardAccountNodeType[];
  PointsAccount_aggregate?: {
    aggregate?: {
      count: number;
    };
  };
}

interface LeaderboardFallbackCountResponse {
  PointsAccount: Array<{ id: string }>;
}

interface ActivityQueryResponse {
  Delegator_by_pk: DelegatorActivityData | null;
  Operator: Array<{ id: string }>;
  Blueprint: Array<{ id: string; owner: string }>;
  Service: Array<{ id: string; owner: string }>;
  JobCall: Array<{ id: string; caller: string }>;
}

interface RoleAccountsResponse {
  Operator?: Array<{ id: string }>;
  Delegator?: Array<{ id: string }>;
  Blueprint?: Array<{ owner: string }>;
  JobCall?: Array<{ caller: string }>;
}

interface RoleCountsResponse {
  Operator_aggregate?: {
    aggregate?: { count: number };
  };
  Delegator_aggregate?: {
    aggregate?: { count: number };
  };
  Blueprint_aggregate?: {
    aggregate?: { count: number };
  };
  JobCall_aggregate?: {
    aggregate?: { count: number };
  };
}

const LEADERBOARD_QUERY = `
  query LeaderboardQuery(
    $limit: Int!
    $offset: Int!
    $timestampSevenDaysAgo: numeric!
    $accountIdQuery: String!
    $excludedAccountIds: [String!]
  ) {
    PointsAccount(
      limit: $limit
      offset: $offset
      order_by: { leaderboardPoints: desc }
      where: {
        id: {
          _ilike: $accountIdQuery
          _nin: $excludedAccountIds
        }
      }
    ) {
      id
      totalPoints
      totalMainnetPoints
      totalTestnetPoints
      leaderboardPoints
      updatedAt
      snapshots(
        order_by: { blockNumber: asc }
        where: { timestamp: { _gte: $timestampSevenDaysAgo } }
      ) {
        id
        blockNumber
        timestamp
        totalPoints
      }
    }
    PointsAccount_aggregate(
      where: {
        id: {
          _ilike: $accountIdQuery
          _nin: $excludedAccountIds
        }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

const LEADERBOARD_COUNT_FALLBACK_QUERY = `
  query LeaderboardCountFallback(
    $limit: Int!
    $offset: Int!
    $accountIdQuery: String!
    $excludedAccountIds: [String!]
  ) {
    PointsAccount(
      limit: $limit
      offset: $offset
      where: {
        id: {
          _ilike: $accountIdQuery
          _nin: $excludedAccountIds
        }
      }
    ) {
      id
    }
  }
`;

const ACTIVITY_QUERY = `
  query AccountActivity($accountId: String!) {
    Delegator_by_pk(id: $accountId) {
      id
      totalDeposited
      totalDelegated
      assetPositions {
        id
        token
        totalDeposited
      }
      delegations {
        id
        operator { id }
        token
        shares
      }
      liquidVaultPositions {
        id
        shares
      }
    }
    Operator(where: { id: { _eq: $accountId } }) {
      id
    }
    Blueprint(where: { owner: { _eq: $accountId } }) {
      id
      owner
    }
    Service(where: { owner: { _eq: $accountId } }) {
      id
      owner
    }
    JobCall(where: { caller: { _eq: $accountId } }) {
      id
      caller
    }
  }
`;

const ROLE_ACCOUNTS_QUERY = `
  query RoleAccounts(
    $includeOperators: Boolean!
    $includeStakers: Boolean!
    $includeDevelopers: Boolean!
    $includeCustomers: Boolean!
  ) {
    Operator @include(if: $includeOperators) {
      id
    }
    Delegator(
      where: {
        _or: [
          { totalDeposited: { _gt: "0" } }
          { totalDelegated: { _gt: "0" } }
        ]
      }
    ) @include(if: $includeStakers) {
      id
    }
    Blueprint(
      distinct_on: owner
      order_by: { owner: asc }
    ) @include(if: $includeDevelopers) {
      owner
    }
    JobCall(
      distinct_on: caller
      order_by: { caller: asc }
    ) @include(if: $includeCustomers) {
      caller
    }
  }
`;

const ROLE_COUNTS_QUERY = `
  query RoleCounts {
    Operator_aggregate {
      aggregate {
        count
      }
    }
    Delegator_aggregate(
      where: {
        _or: [
          { totalDeposited: { _gt: "0" } }
          { totalDelegated: { _gt: "0" } }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    Blueprint_aggregate {
      aggregate {
        count(columns: owner, distinct: true)
      }
    }
    JobCall_aggregate {
      aggregate {
        count(columns: caller, distinct: true)
      }
    }
  }
`;

const normalizeAccountIds = (accounts: string[]): Set<string> => {
  return new Set(
    accounts
      .map((entry) => entry.toLowerCase())
      .filter((entry) => !EXCLUDED_LEADERBOARD_ACCOUNT_SET.has(entry)),
  );
};

const computeFallbackTotalCount = async (
  envioNetwork: EnvioNetwork,
  accountIdQuery: string,
): Promise<number> => {
  const fallbackPageSize = 1000;
  let totalCount = 0;
  let offset = 0;

  while (true) {
    const fallbackResult = await executeEnvioGraphQL<
      LeaderboardFallbackCountResponse,
      {
        limit: number;
        offset: number;
        accountIdQuery: string;
        excludedAccountIds: string[];
      }
    >(
      LEADERBOARD_COUNT_FALLBACK_QUERY,
      {
        limit: fallbackPageSize,
        offset,
        accountIdQuery,
        excludedAccountIds: EXCLUDED_LEADERBOARD_ACCOUNT_IDS,
      },
      envioNetwork,
    );

    if (fallbackResult.errors?.length) {
      throw new Error(
        `Failed to fetch fallback leaderboard count: ${fallbackResult.errors
          .map((error) => error.message)
          .join('; ')}`,
      );
    }

    const pageSize = fallbackResult.data.PointsAccount.length;
    totalCount += pageSize;

    if (pageSize < fallbackPageSize) {
      break;
    }

    offset += fallbackPageSize;
  }

  return totalCount;
};

const fetchLeaderboard = async (
  network: NetworkType,
  limit: number,
  offset: number,
  timestampSevenDaysAgo: number,
  accountIdQuery?: string,
): Promise<{ nodes: LeaderboardAccountNodeType[]; totalCount: number }> => {
  const envioNetwork = toEnvioNetwork(network);
  const accountQuery = accountIdQuery ? `%${accountIdQuery}%` : '%%';

  const result = await executeEnvioGraphQL<
    LeaderboardQueryResponse,
    {
      limit: number;
      offset: number;
      timestampSevenDaysAgo: number;
      accountIdQuery: string;
      excludedAccountIds: string[];
    }
  >(
    LEADERBOARD_QUERY,
    {
      limit,
      offset,
      timestampSevenDaysAgo,
      accountIdQuery: accountQuery,
      excludedAccountIds: EXCLUDED_LEADERBOARD_ACCOUNT_IDS,
    },
    envioNetwork,
  );

  if (result.errors?.length && !isAggregateFieldUnavailable(result.errors)) {
    throw new Error(
      `Failed to fetch leaderboard data: ${result.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }

  const nodes = result.data.PointsAccount;

  if (!result.errors?.length) {
    return {
      nodes,
      totalCount: result.data.PointsAccount_aggregate?.aggregate?.count ?? 0,
    };
  }

  const totalCount = await computeFallbackTotalCount(
    envioNetwork,
    accountQuery,
  );

  return {
    nodes,
    totalCount,
  };
};

const fetchAccountActivity = async (
  network: NetworkType,
  accountId: string,
): Promise<ActivityQueryResponse> => {
  const result = await executeEnvioGraphQL<
    ActivityQueryResponse,
    { accountId: string }
  >(ACTIVITY_QUERY, { accountId }, toEnvioNetwork(network));

  if (result.errors?.length) {
    throw new Error(
      `Failed to fetch account activity: ${result.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }

  return result.data;
};

// Auto-refresh interval in milliseconds (10 seconds)
const LEADERBOARD_REFETCH_INTERVAL = 10_000;

export function useLeaderboard(
  network: NetworkType,
  first: number,
  offset: number,
  timestampSevenDaysAgo: number,
  accountIdQuery?: string,
) {
  return useQuery({
    queryKey: [
      LEADERBOARD_QUERY_KEY,
      network,
      first,
      offset,
      timestampSevenDaysAgo,
      accountIdQuery,
      EXCLUDED_LEADERBOARD_ACCOUNT_IDS.join(','),
    ],
    queryFn: () =>
      fetchLeaderboard(
        network,
        first,
        offset,
        timestampSevenDaysAgo,
        accountIdQuery,
      ),
    enabled: first > 0 && offset >= 0 && timestampSevenDaysAgo > 0,
    placeholderData: (prev) => prev,
    refetchInterval: LEADERBOARD_REFETCH_INTERVAL,
  });
}

export function useAccountActivity(network: NetworkType, accountId: string) {
  return useQuery({
    queryKey: ['accountActivity', network, accountId],
    queryFn: () => fetchAccountActivity(network, accountId),
    enabled: !!accountId,
    staleTime: Infinity,
  });
}

export interface RoleAccountsData {
  operators: Set<string>;
  stakers: Set<string>;
  developers: Set<string>;
  customers: Set<string>;
}

export interface RoleCountsData {
  operators: number;
  stakers: number;
  developers: number;
  customers: number;
}

const fetchRoleCounts = async (
  network: NetworkType,
): Promise<RoleCountsData | undefined> => {
  const result = await executeEnvioGraphQL<
    RoleCountsResponse,
    Record<string, never>
  >(ROLE_COUNTS_QUERY, {}, toEnvioNetwork(network));

  if (result.errors?.length) {
    // Keep role filtering functional even if aggregate capabilities vary by environment.
    return undefined;
  }

  return {
    operators: result.data.Operator_aggregate?.aggregate?.count ?? 0,
    stakers: result.data.Delegator_aggregate?.aggregate?.count ?? 0,
    developers: result.data.Blueprint_aggregate?.aggregate?.count ?? 0,
    customers: result.data.JobCall_aggregate?.aggregate?.count ?? 0,
  };
};

const fetchRoleAccounts = async (
  network: NetworkType,
  selectedRoles: RoleFilterEnum[],
): Promise<RoleAccountsData> => {
  if (selectedRoles.length === 0) {
    return {
      operators: new Set(),
      stakers: new Set(),
      developers: new Set(),
      customers: new Set(),
    };
  }

  const includeOperators = selectedRoles.includes(RoleFilterEnum.OPERATOR);
  const includeStakers = selectedRoles.includes(RoleFilterEnum.STAKER);
  const includeDevelopers = selectedRoles.includes(RoleFilterEnum.DEVELOPER);
  const includeCustomers = selectedRoles.includes(RoleFilterEnum.CUSTOMER);

  const result = await executeEnvioGraphQL<
    RoleAccountsResponse,
    {
      includeOperators: boolean;
      includeStakers: boolean;
      includeDevelopers: boolean;
      includeCustomers: boolean;
    }
  >(
    ROLE_ACCOUNTS_QUERY,
    {
      includeOperators,
      includeStakers,
      includeDevelopers,
      includeCustomers,
    },
    toEnvioNetwork(network),
  );

  if (result.errors?.length) {
    throw new Error(
      `Failed to fetch role accounts: ${result.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }

  return {
    operators: normalizeAccountIds(
      (result.data.Operator ?? []).map((item) => item.id),
    ),
    stakers: normalizeAccountIds(
      (result.data.Delegator ?? []).map((item) => item.id),
    ),
    developers: normalizeAccountIds(
      (result.data.Blueprint ?? []).map((item) => item.owner),
    ),
    customers: normalizeAccountIds(
      (result.data.JobCall ?? []).map((item) => item.caller),
    ),
  };
};

export const getAccountIdsForRoles = (
  roleAccounts: RoleAccountsData,
  selectedRoles: RoleFilterEnum[],
): Set<string> => {
  if (selectedRoles.length === 0) {
    return new Set();
  }

  const accountIds = new Set<string>();

  for (const role of selectedRoles) {
    switch (role) {
      case RoleFilterEnum.OPERATOR:
        roleAccounts.operators.forEach((id) => accountIds.add(id));
        break;
      case RoleFilterEnum.STAKER:
        roleAccounts.stakers.forEach((id) => accountIds.add(id));
        break;
      case RoleFilterEnum.DEVELOPER:
        roleAccounts.developers.forEach((id) => accountIds.add(id));
        break;
      case RoleFilterEnum.CUSTOMER:
        roleAccounts.customers.forEach((id) => accountIds.add(id));
        break;
    }
  }

  return accountIds;
};

export function useRoleAccounts(
  network: NetworkType,
  selectedRoles: RoleFilterEnum[],
) {
  const sortedRoles = [...selectedRoles].sort();

  return useQuery({
    queryKey: ['roleAccounts', network, sortedRoles.join(',')],
    queryFn: () => fetchRoleAccounts(network, sortedRoles),
    enabled: sortedRoles.length > 0,
    staleTime: 30_000,
  });
}

export function useRoleCounts(network: NetworkType) {
  return useQuery({
    queryKey: ['roleCounts', network],
    queryFn: () => fetchRoleCounts(network),
    staleTime: 60_000,
  });
}

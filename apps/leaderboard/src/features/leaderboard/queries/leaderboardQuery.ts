import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import { useQuery } from '@tanstack/react-query';
import { LEADERBOARD_QUERY_KEY } from '../../../constants/query';
import { RoleFilterEnum } from '../constants';

// Team accounts to exclude from leaderboard (EVM addresses)
const TEAM_ACCOUNTS = [
  '0x0000000000000000000000000000000000000000', // Placeholder - update with actual team addresses
] as const;

/**
 * PointsAccount node from NVO indexer
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
}

interface ActivityQueryResponse {
  Delegator_by_pk: DelegatorActivityData | null;
  Operator: Array<{ id: string }>;
  Blueprint: Array<{ id: string; owner: string }>;
  Service: Array<{ id: string; owner: string }>;
  JobCall: Array<{ id: string; caller: string }>;
}

const getEndpoint = (network: NetworkType): string => {
  if (network === 'MAINNET') {
    return (
      import.meta.env.VITE_ENVIO_MAINNET_ENDPOINT ||
      'http://localhost:8080/v1/graphql'
    );
  }
  return (
    import.meta.env.VITE_ENVIO_TESTNET_ENDPOINT ||
    'http://localhost:8080/v1/graphql'
  );
};

const LEADERBOARD_QUERY = `
  query LeaderboardQuery(
    $limit: Int!
    $offset: Int!
    $timestampSevenDaysAgo: numeric!
    $accountIdQuery: String
  ) {
    PointsAccount(
      limit: $limit
      offset: $offset
      order_by: { leaderboardPoints: desc }
      where: { id: { _ilike: $accountIdQuery } }
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

const fetchLeaderboard = async (
  network: NetworkType,
  limit: number,
  offset: number,
  timestampSevenDaysAgo: number,
  accountIdQuery?: string,
): Promise<{ nodes: LeaderboardAccountNodeType[]; totalCount: number }> => {
  const endpoint = getEndpoint(network);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: LEADERBOARD_QUERY,
      variables: {
        limit,
        offset,
        timestampSevenDaysAgo,
        accountIdQuery: accountIdQuery ? `%${accountIdQuery}%` : '%%',
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = (await response.json()) as { data: LeaderboardQueryResponse };

  // Filter out team accounts
  const filteredAccounts = result.data.PointsAccount.filter(
    (account) =>
      !TEAM_ACCOUNTS.includes(
        account.id.toLowerCase() as (typeof TEAM_ACCOUNTS)[number],
      ),
  );

  return {
    nodes: filteredAccounts,
    totalCount: filteredAccounts.length,
  };
};

const fetchAccountActivity = async (
  network: NetworkType,
  accountId: string,
): Promise<ActivityQueryResponse> => {
  const endpoint = getEndpoint(network);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: ACTIVITY_QUERY,
      variables: { accountId },
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = (await response.json()) as { data: ActivityQueryResponse };
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

const ROLE_ACCOUNTS_QUERY = `
  query RoleAccounts {
    Operator {
      id
    }
    Delegator(where: { _or: [
      { totalDeposited: { _gt: "0" } },
      { totalDelegated: { _gt: "0" } }
    ]}) {
      id
    }
    Blueprint {
      owner
    }
    JobCall {
      caller
    }
  }
`;

interface RoleAccountsResponse {
  Operator: Array<{ id: string }>;
  Delegator: Array<{ id: string }>;
  Blueprint: Array<{ owner: string }>;
  JobCall: Array<{ caller: string }>;
}

export interface RoleAccountsData {
  operators: Set<string>;
  stakers: Set<string>;
  developers: Set<string>;
  customers: Set<string>;
}

const fetchRoleAccounts = async (
  network: NetworkType,
): Promise<RoleAccountsData> => {
  const endpoint = getEndpoint(network);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: ROLE_ACCOUNTS_QUERY,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = (await response.json()) as { data: RoleAccountsResponse };

  return {
    operators: new Set(result.data.Operator.map((o) => o.id.toLowerCase())),
    stakers: new Set(result.data.Delegator.map((d) => d.id.toLowerCase())),
    developers: new Set(
      result.data.Blueprint.map((b) => b.owner.toLowerCase()),
    ),
    customers: new Set(result.data.JobCall.map((j) => j.caller.toLowerCase())),
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

export function useRoleAccounts(network: NetworkType) {
  return useQuery({
    queryKey: ['roleAccounts', network],
    queryFn: () => fetchRoleAccounts(network),
    staleTime: 30_000,
  });
}

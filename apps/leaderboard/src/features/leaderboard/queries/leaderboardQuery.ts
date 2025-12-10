import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import { useQuery } from '@tanstack/react-query';
import { LEADERBOARD_QUERY_KEY } from '../../../constants/query';

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
export interface LeaderboardAccountWithActivity extends LeaderboardAccountNodeType {
  delegator?: DelegatorActivityData;
  isOperator: boolean;
  blueprintCount: number;
  serviceCount: number;
  jobCallCount: number;
}

interface LeaderboardQueryResponse {
  pointsAccounts: LeaderboardAccountNodeType[];
}

interface ActivityQueryResponse {
  delegator: DelegatorActivityData | null;
  operators: Array<{ id: string }>;
  blueprints: Array<{ id: string; owner: string }>;
  services: Array<{ id: string; owner: string }>;
  jobCalls: Array<{ id: string; caller: string }>;
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
    $first: Int!
    $skip: Int!
    $timestampSevenDaysAgo: BigInt!
    $accountIdQuery: String
  ) {
    pointsAccounts(
      first: $first
      skip: $skip
      orderBy: leaderboardPoints
      orderDirection: desc
      where: { id_contains: $accountIdQuery }
    ) {
      id
      totalPoints
      totalMainnetPoints
      totalTestnetPoints
      leaderboardPoints
      updatedAt
      snapshots(
        orderBy: blockNumber
        orderDirection: asc
        where: { timestamp_gte: $timestampSevenDaysAgo }
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
    delegator(id: $accountId) {
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
    operators(where: { id: $accountId }) {
      id
    }
    blueprints(where: { owner: $accountId }) {
      id
      owner
    }
    services(where: { owner: $accountId }) {
      id
      owner
    }
    jobCalls(where: { caller: $accountId }) {
      id
      caller
    }
  }
`;

const fetchLeaderboard = async (
  network: NetworkType,
  first: number,
  skip: number,
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
        first,
        skip,
        timestampSevenDaysAgo: String(timestampSevenDaysAgo),
        accountIdQuery: accountIdQuery || '',
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = (await response.json()) as { data: LeaderboardQueryResponse };

  // Filter out team accounts
  const filteredAccounts = result.data.pointsAccounts.filter(
    (account) =>
      !TEAM_ACCOUNTS.includes(account.id.toLowerCase() as (typeof TEAM_ACCOUNTS)[number]),
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
      fetchLeaderboard(network, first, offset, timestampSevenDaysAgo, accountIdQuery),
    enabled: first > 0 && offset >= 0 && timestampSevenDaysAgo > 0,
    placeholderData: (prev) => prev,
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

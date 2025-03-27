import { graphql } from '@tangle-network/tangle-shared-ui/graphql';
import { AccountsOrderBy } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import { executeGraphQL } from '@tangle-network/tangle-shared-ui/utils/executeGraphQL';
import { useQuery } from '@tanstack/react-query';

export const TEAM_ACCOUNTS = [
  '5CJFrNyjRahyb7kcn8HH3LPJRaZf2aq6jguk5kx5V5Aa6rXh',
  '5H9Ahg236YVtzKnsPp5kokY8qswWNoY65dWrjS3znxVwkaue',
  '5E4ixheSH99qbZxXYSLt242bc933rYJ3XrXFt34d2ViVkFZY',
  '5FjXDSpyiLbST4PpYzX399vymhHYhxKCP8BNhLBEmLfrUYNv',
  '5Dqf9U5dgQ9GLqdfaxXGjpZf9af1sCV8UrnpRgqJPbe3wCwX',
] as const;

export enum ReactQueryKey {
  Leaderboard = 'Leaderboard',
}

const LeaderboardQueryDocument = graphql(/* GraphQL */ `
  query LeaderboardTableDocument(
    $first: Int!
    $offset: Int!
    $blockNumberSevenDaysAgo: Int!
    $accountsOrderBy: [AccountsOrderBy!]
    $teamAccounts: [String!]!
  ) {
    accounts(
      first: $first
      offset: $offset
      orderBy: $accountsOrderBy
      filter: { id: { notIn: $teamAccounts } }
    ) {
      nodes {
        id
        totalPoints
        totalMainnetPoints
        totalTestnetPoints
        delegators(first: 1) {
          nodes {
            deposits {
              totalCount
            }
            delegations {
              totalCount
              nodes {
                assetId
              }
            }
          }
        }
        operators {
          totalCount
        }
        lstPoolMembers {
          totalCount
        }
        blueprints {
          totalCount
        }
        services {
          totalCount
        }
        jobCalls {
          totalCount
        }
        testnetTaskCompletions(first: 1) {
          nodes {
            hasDepositedThreeAssets
            hasDelegatedAssets
            hasNominated
            hasLiquidStaked
            hasNativeRestaked
            hasBonusPoints
          }
        }
        snapshots(
          orderBy: BLOCK_NUMBER_DESC
          filter: {
            blockNumber: { greaterThanOrEqualTo: $blockNumberSevenDaysAgo }
          }
        ) {
          nodes {
            blockNumber
            totalPoints
          }
        }
        createdAt
        lastUpdateAt
      }
      totalCount
    }
  }
`);

const fetcher = async (
  first: number,
  offset: number,
  blockNumberSevenDaysAgo: number,
) => {
  const result = await executeGraphQL(LeaderboardQueryDocument, {
    first,
    offset,
    blockNumberSevenDaysAgo,
    accountsOrderBy: [AccountsOrderBy.TotalPointsDesc],
    teamAccounts: TEAM_ACCOUNTS.map((account) => account.toLowerCase()),
  });
  return result.data.accounts;
};

export function useLeaderboard(
  first: number,
  offset: number,
  blockNumberSevenDaysAgo: number,
) {
  return useQuery({
    queryKey: [
      ReactQueryKey.Leaderboard,
      first,
      offset,
      blockNumberSevenDaysAgo,
    ],
    queryFn: () => fetcher(first, offset, blockNumberSevenDaysAgo),
    enabled: first > 0 && offset >= 0 && blockNumberSevenDaysAgo > 0,
  });
}

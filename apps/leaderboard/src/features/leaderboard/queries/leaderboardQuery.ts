import { graphql } from '@tangle-network/tangle-shared-ui/graphql';
import { executeGraphQL } from '@tangle-network/tangle-shared-ui/utils/executeGraphQL';
import { useQuery } from '@tanstack/react-query';
import { LEADERBOARD_QUERY_KEY } from '../../../constants/query';

export const TEAM_ACCOUNTS = [
  '5CJFrNyjRahyb7kcn8HH3LPJRaZf2aq6jguk5kx5V5Aa6rXh',
  '5H9Ahg236YVtzKnsPp5kokY8qswWNoY65dWrjS3znxVwkaue',
  '5E4ixheSH99qbZxXYSLt242bc933rYJ3XrXFt34d2ViVkFZY',
  '5FjXDSpyiLbST4PpYzX399vymhHYhxKCP8BNhLBEmLfrUYNv',
  '5Dqf9U5dgQ9GLqdfaxXGjpZf9af1sCV8UrnpRgqJPbe3wCwX',
] as const;

const LeaderboardQueryDocument = graphql(/* GraphQL */ `
  query LeaderboardTableDocument(
    $first: Int!
    $offset: Int!
    $blockNumberSevenDaysAgo: Int!
    $teamAccounts: [String!]!
    $accountIdQuery: String
  ) {
    accounts(
      first: $first
      offset: $offset
      orderBy: [TOTAL_POINTS_DESC]
      filter: {
        id: { notIn: $teamAccounts, includesInsensitive: $accountIdQuery }
      }
    ) {
      nodes {
        id
        totalPoints
        totalMainnetPoints
        totalTestnetPoints
        isValidator
        isNominator
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
          orderBy: BLOCK_NUMBER_ASC
          filter: {
            blockNumber: { greaterThanOrEqualTo: $blockNumberSevenDaysAgo }
          }
        ) {
          totalCount
          nodes {
            blockNumber
            totalPoints
          }
        }
        createdAt
        createdAtTimestamp
        lastUpdatedAt
        lastUpdatedAtTimestamp
      }
      totalCount
    }
  }
`);

const fetcher = async (
  first: number,
  offset: number,
  blockNumberSevenDaysAgo: number,
  accountIdQuery?: string,
) => {
  const result = await executeGraphQL(LeaderboardQueryDocument, {
    first,
    offset,
    blockNumberSevenDaysAgo,
    teamAccounts: [],
    accountIdQuery,
  });
  return result.data.accounts;
};

export function useLeaderboard(
  first: number,
  offset: number,
  blockNumberSevenDaysAgo: number,
  accountIdQuery?: string,
) {
  return useQuery({
    queryKey: [
      LEADERBOARD_QUERY_KEY,
      first,
      offset,
      blockNumberSevenDaysAgo,
      accountIdQuery,
    ],
    queryFn: () =>
      fetcher(first, offset, blockNumberSevenDaysAgo, accountIdQuery),
    enabled: first > 0 && offset >= 0 && blockNumberSevenDaysAgo > 0,
    placeholderData: (prev) => prev,
  });
}

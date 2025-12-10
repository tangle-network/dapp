#!/usr/bin/env node

/**
 * Leaderboard Data Dump Script
 * Fetches all leaderboard data from mainnet and testnet GraphQL endpoints
 * Output: __fixtures__/leaderboard/
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), '__fixtures__/leaderboard');

const ENDPOINTS = {
  MAINNET: 'https://mainnet-gql.tangle.tools/graphql',
  TESTNET: 'https://testnet-gql.tangle.tools/graphql',
};

const TEAM_ACCOUNTS = [
  '5CJFrNyjRahyb7kcn8HH3LPJRaZf2aq6jguk5kx5V5Aa6rXh',
  '5H9Ahg236YVtzKnsPp5kokY8qswWNoY65dWrjS3znxVwkaue',
  '5E4ixheSH99qbZxXYSLt242bc933rYJ3XrXFt34d2ViVkFZY',
  '5FjXDSpyiLbST4PpYzX399vymhHYhxKCP8BNhLBEmLfrUYNv',
  '5Dqf9U5dgQ9GLqdfaxXGjpZf9af1sCV8UrnpRgqJPbe3wCwX',
];

const LEADERBOARD_QUERY = `
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
`;

const INDEXING_PROGRESS_QUERY = `
  query IndexingProgress {
    _metadata {
      lastProcessedHeight
      targetHeight
    }
  }
`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function executeGraphQL(endpoint, query, variables = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/graphql-response+json',
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (error) {
      if (attempt < retries) {
        const delay = attempt * 2000;
        console.log(`  Retry ${attempt}/${retries} after ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}

async function fetchAllLeaderboardData(network) {
  const endpoint = ENDPOINTS[network];
  console.log(`\nFetching ${network} leaderboard data...`);

  const PAGE_SIZE = 20;
  let offset = 0;
  let allNodes = [];
  let totalCount = 0;

  // Use block 0 to get all historical data
  const blockNumberSevenDaysAgo = 0;

  while (true) {
    console.log(`  Fetching offset ${offset}...`);

    const data = await executeGraphQL(endpoint, LEADERBOARD_QUERY, {
      first: PAGE_SIZE,
      offset,
      blockNumberSevenDaysAgo,
      teamAccounts: TEAM_ACCOUNTS,
      accountIdQuery: '',
    });

    if (!data.accounts) {
      console.log(`  No accounts data returned`);
      break;
    }

    const nodes = data.accounts.nodes || [];
    totalCount = data.accounts.totalCount;

    allNodes = [...allNodes, ...nodes];
    console.log(`  Got ${nodes.length} accounts (total: ${allNodes.length}/${totalCount})`);

    if (nodes.length < PAGE_SIZE || allNodes.length >= totalCount) {
      break;
    }

    offset += PAGE_SIZE;
  }

  console.log(`  Finished: ${allNodes.length} total accounts`);

  return {
    accounts: {
      nodes: allNodes,
      totalCount,
    },
  };
}

async function fetchIndexingProgress(network) {
  const endpoint = ENDPOINTS[network];
  console.log(`Fetching ${network} indexing progress...`);

  const data = await executeGraphQL(endpoint, INDEXING_PROGRESS_QUERY);
  console.log(`  lastProcessedHeight: ${data._metadata?.lastProcessedHeight}`);
  console.log(`  targetHeight: ${data._metadata?.targetHeight}`);

  return data;
}

function saveJson(timestamp, filename, data) {
  const filepath = join(OUTPUT_DIR, `${timestamp}_${filename}`);
  writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`Saved: ${filepath}`);
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  console.log('=== Leaderboard Data Dump ===');
  console.log(`Timestamp: ${timestamp}`);

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  try {
    // Fetch testnet first
    const testnetProgress = await fetchIndexingProgress('TESTNET');
    const testnetLeaderboard = await fetchAllLeaderboardData('TESTNET');
    saveJson(timestamp, 'testnet-indexing-progress.json', testnetProgress);
    saveJson(timestamp, 'testnet-leaderboard.json', testnetLeaderboard);

    // Fetch mainnet
    const mainnetProgress = await fetchIndexingProgress('MAINNET');
    const mainnetLeaderboard = await fetchAllLeaderboardData('MAINNET');
    saveJson(timestamp, 'mainnet-indexing-progress.json', mainnetProgress);
    saveJson(timestamp, 'mainnet-leaderboard.json', mainnetLeaderboard);

    console.log('\n=== Summary ===');
    console.log(`Testnet accounts: ${testnetLeaderboard.accounts.totalCount}`);
    console.log(`Mainnet accounts: ${mainnetLeaderboard.accounts.totalCount}`);
    console.log('\nDump complete!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

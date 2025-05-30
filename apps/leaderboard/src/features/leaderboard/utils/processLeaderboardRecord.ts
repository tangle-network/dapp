import { ZERO_BIG_INT } from '@tangle-network/dapp-config/constants';
import type { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { toBigInt } from '@tangle-network/ui-components';
import find from 'lodash/find';
import findLast from 'lodash/findLast';
import { BadgeEnum } from '../constants';
import type { LeaderboardAccountNodeType } from '../queries';
import { Account, TestnetTaskCompletion } from '../types';

const calculateLastSevenDaysPoints = (record: LeaderboardAccountNodeType) => {
  const firstSnapshot = find(record.snapshots.nodes, (snapshot) => {
    return snapshot !== null;
  });

  const lastSnapshot = findLast(record.snapshots.nodes, (snapshot) => {
    return snapshot !== null;
  });

  if (!firstSnapshot || !lastSnapshot) {
    return ZERO_BIG_INT;
  }

  const firstSnapshotTotalPointsResult = toBigInt(firstSnapshot.totalPoints);

  const lastSnapshotTotalPointsResult = toBigInt(lastSnapshot.totalPoints);

  if (
    firstSnapshotTotalPointsResult.error !== null ||
    lastSnapshotTotalPointsResult.error !== null
  ) {
    console.error(
      'Failed to convert snapshot.totalPoints to bigint',
      firstSnapshot,
      lastSnapshot,
    );

    return ZERO_BIG_INT;
  }

  return (
    lastSnapshotTotalPointsResult.result - firstSnapshotTotalPointsResult.result
  );
};

const determineBadges = (record: LeaderboardAccountNodeType): BadgeEnum[] => {
  const badges: BadgeEnum[] = [];

  const hasDeposited = record.delegators?.nodes.find(
    (node) => node?.deposits.totalCount && node.deposits.totalCount > 0,
  );

  if (hasDeposited) {
    badges.push(BadgeEnum.RESTAKE_DEPOSITOR);
  }

  const hasDelegated = record.delegators?.nodes.find(
    (node) => node?.delegations.totalCount && node.delegations.totalCount > 0,
  );

  if (hasDelegated) {
    badges.push(BadgeEnum.RESTAKE_DELEGATOR);
  }

  const hasLiquidStaked = record.lstPoolMembers.totalCount > 0;
  if (hasLiquidStaked) {
    badges.push(BadgeEnum.LIQUID_STAKER);
  }

  const hasNativeRestaked = record.delegators?.nodes.find(
    (node) =>
      node?.delegations.nodes &&
      node.delegations.nodes.find(
        (delegation) =>
          delegation?.assetId && delegation.assetId === `${ZERO_BIG_INT}`,
      ),
  );

  if (hasNativeRestaked) {
    badges.push(BadgeEnum.NATIVE_RESTAKER);
  }

  const isOperator = record.operators.totalCount > 0;
  if (isOperator) {
    badges.push(BadgeEnum.OPERATOR);
  }

  const isBlueprintOwner = record.blueprints.totalCount > 0;
  if (isBlueprintOwner) {
    badges.push(BadgeEnum.BLUEPRINT_OWNER);
  }

  const isServiceProvider = record.services.totalCount > 0;
  if (isServiceProvider) {
    badges.push(BadgeEnum.SERVICE_PROVIDER);
  }

  const isJobCaller = record.jobCalls.totalCount > 0;
  if (isJobCaller) {
    badges.push(BadgeEnum.JOB_CALLER);
  }

  const isValidator = record.isValidator ?? false;
  if (isValidator) {
    badges.push(BadgeEnum.VALIDATOR);
  }

  const isNominator = record.isNominator ?? false;
  if (isNominator) {
    badges.push(BadgeEnum.NOMINATOR);
  }

  return badges;
};

const calculateActivityCounts = (record: LeaderboardAccountNodeType) => {
  const depositCount = record.delegators?.nodes.reduce((acc, node) => {
    if (!node) {
      return acc;
    }

    return acc + node.deposits.totalCount;
  }, 0);

  const delegationCount = record.delegators?.nodes.reduce((acc, node) => {
    if (!node) {
      return acc;
    }

    return acc + node.delegations.totalCount;
  }, 0);

  return {
    blueprintCount: record.blueprints.totalCount,
    depositCount,
    delegationCount,
    liquidStakingPoolCount: record.lstPoolMembers.totalCount,
    serviceCount: record.services.totalCount,
    jobCallCount: record.jobCalls.totalCount,
  };
};

const processTestnetTaskCompletion = (record: LeaderboardAccountNodeType) => {
  const testnetTask = record.testnetTaskCompletions.nodes.find(
    (node) => node !== null,
  );

  if (!testnetTask) {
    return undefined;
  }

  const testnetTaskCompletion: Omit<
    TestnetTaskCompletion,
    'completionPercentage'
  > = {
    depositedThreeAssets: !!testnetTask.hasDepositedThreeAssets,
    delegatedAssets: !!testnetTask.hasDelegatedAssets,
    liquidStaked: !!testnetTask.hasLiquidStaked,
    nominated: !!testnetTask.hasNominated,
    nativeRestaked: !!testnetTask.hasNativeRestaked,
    bonus: !!testnetTask.hasBonusPoints,
  };

  return {
    ...testnetTaskCompletion,
    completionPercentage:
      (Object.values(testnetTaskCompletion).filter(Boolean).length /
        Object.keys(testnetTaskCompletion).length) *
      100,
  };
};

const processPointsHistory = (record: LeaderboardAccountNodeType) => {
  return record.snapshots.nodes
    .map((snapshot) => {
      if (!snapshot) {
        return null;
      }

      const snapshotPointsResult = toBigInt(snapshot.totalPoints);

      if (snapshotPointsResult.error !== null) {
        console.error(
          'Failed to convert snapshot.totalPoints to bigint',
          snapshot,
        );
        return null;
      }

      return {
        blockNumber: snapshot.blockNumber,
        points: snapshotPointsResult.result,
      };
    })
    .filter((item) => item !== null);
};

export const processLeaderboardRecord = (
  record: LeaderboardAccountNodeType | null,
  index: number,
  pageIndex: number,
  pageSize: number,
  identity: IdentityType | null | undefined,
): Account | null => {
  if (!record) {
    return null;
  }

  const totalPointsResult = toBigInt(record.totalPoints);

  if (totalPointsResult.error !== null) {
    console.error('Failed to convert totalPoints to bigint', record);
    return null;
  }

  const totalMainnetPointsResult = toBigInt(record.totalMainnetPoints);

  if (totalMainnetPointsResult.error !== null) {
    console.error('Failed to convert totalMainnetPoints to bigint', record);
    return null;
  }

  const totalTestnetPointsResult = toBigInt(record.totalTestnetPoints);

  if (totalTestnetPointsResult.error !== null) {
    console.error('Failed to convert totalTestnetPoints to bigint', record);
    return null;
  }

  const lastSevenDays = calculateLastSevenDaysPoints(record);
  const badges = determineBadges(record);
  const activity = calculateActivityCounts(record);
  const testnetTaskCompletion = processTestnetTaskCompletion(record);
  const pointsHistory = processPointsHistory(record);

  return {
    id: record.id,
    rank: pageIndex * pageSize + index + 1,
    totalPoints: totalPointsResult.result,
    pointsBreakdown: {
      mainnet: totalMainnetPointsResult.result,
      testnet: totalTestnetPointsResult.result,
      lastSevenDays,
    },
    badges,
    activity,
    testnetTaskCompletion,
    pointsHistory,
    createdAt: record.createdAt,
    createdAtTimestamp: record.createdAtTimestamp,
    lastUpdatedAt: record.lastUpdatedAt,
    lastUpdatedAtTimestamp: record.lastUpdatedAtTimestamp,
    identity,
    // TODO: This should fetch from the API once the server supports multi-chain
    network: 'TESTNET',
  } satisfies Account;
};

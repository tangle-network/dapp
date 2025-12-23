import { ZERO_BIG_INT } from '@tangle-network/dapp-config/constants';
import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import find from 'lodash/find';
import findLast from 'lodash/findLast';
import { BadgeEnum } from '../constants';
import type { PointsHistory } from '../types';
import type {
  LeaderboardAccountNodeType,
  DelegatorActivityData,
} from '../queries';
import { Account } from '../types';

/**
 * Activity data structure for badge determination
 */
export interface ActivityData {
  delegator?: DelegatorActivityData;
  isOperator: boolean;
  blueprintCount: number;
  serviceCount: number;
  jobCallCount: number;
}

const safeBigInt = (value: string | undefined | null): bigint => {
  if (!value) {
    return ZERO_BIG_INT;
  }
  try {
    return BigInt(value);
  } catch {
    console.error('Failed to convert to bigint:', value);
    return ZERO_BIG_INT;
  }
};

const calculateLastSevenDaysPoints = (
  record: LeaderboardAccountNodeType,
): bigint => {
  const snapshots = record.snapshots;

  if (!snapshots || snapshots.length === 0) {
    return ZERO_BIG_INT;
  }

  const firstSnapshot = find(snapshots, (snapshot) => snapshot !== null);
  const lastSnapshot = findLast(snapshots, (snapshot) => snapshot !== null);

  if (!firstSnapshot || !lastSnapshot) {
    return ZERO_BIG_INT;
  }

  const firstPoints = safeBigInt(firstSnapshot.totalPoints);
  const lastPoints = safeBigInt(lastSnapshot.totalPoints);

  return lastPoints - firstPoints;
};

const determineBadges = (activity?: ActivityData): BadgeEnum[] => {
  const badges: BadgeEnum[] = [];

  if (!activity) {
    return badges;
  }

  const { delegator, isOperator, blueprintCount, serviceCount, jobCallCount } =
    activity;

  // Check for deposits
  const hasDeposited =
    delegator?.assetPositions?.some(
      (pos) => safeBigInt(pos.totalDeposited) > ZERO_BIG_INT,
    ) ?? false;

  if (hasDeposited) {
    badges.push(BadgeEnum.RESTAKE_DEPOSITOR);
  }

  // Check for delegations
  const hasDelegated =
    delegator?.delegations?.some(
      (del) => safeBigInt(del.shares) > ZERO_BIG_INT,
    ) ?? false;

  if (hasDelegated) {
    badges.push(BadgeEnum.RESTAKE_DELEGATOR);
  }

  // Check for liquid vault positions
  const hasLiquidVault =
    delegator?.liquidVaultPositions?.some(
      (pos) => safeBigInt(pos.shares) > ZERO_BIG_INT,
    ) ?? false;

  if (hasLiquidVault) {
    badges.push(BadgeEnum.LIQUID_STAKER);
  }

  // Operator badge
  if (isOperator) {
    badges.push(BadgeEnum.OPERATOR);
  }

  // Blueprint owner badge
  if (blueprintCount > 0) {
    badges.push(BadgeEnum.BLUEPRINT_OWNER);
  }

  // Service provider badge
  if (serviceCount > 0) {
    badges.push(BadgeEnum.SERVICE_PROVIDER);
  }

  // Job caller badge
  if (jobCallCount > 0) {
    badges.push(BadgeEnum.JOB_CALLER);
  }

  return badges;
};

const calculateActivityCounts = (activity?: ActivityData) => {
  if (!activity) {
    return {
      depositCount: 0,
      delegationCount: 0,
      liquidVaultPositionCount: 0,
      blueprintCount: 0,
      serviceCount: 0,
      jobCallCount: 0,
    };
  }

  const { delegator, blueprintCount, serviceCount, jobCallCount } = activity;

  return {
    depositCount: delegator?.assetPositions?.length ?? 0,
    delegationCount: delegator?.delegations?.length ?? 0,
    liquidVaultPositionCount: delegator?.liquidVaultPositions?.length ?? 0,
    blueprintCount,
    serviceCount,
    jobCallCount,
  };
};

const processPointsHistory = (
  record: LeaderboardAccountNodeType,
): PointsHistory[] => {
  if (!record.snapshots) {
    return [];
  }

  return record.snapshots
    .map((snapshot) => {
      if (!snapshot) {
        return null;
      }

      return {
        blockNumber: Number(snapshot.blockNumber),
        timestamp: Number(snapshot.timestamp),
        points: safeBigInt(snapshot.totalPoints),
      };
    })
    .filter((item): item is PointsHistory => item !== null);
};

export const processLeaderboardRecord = (
  record: LeaderboardAccountNodeType | null,
  index: number,
  pageIndex: number,
  pageSize: number,
  activity?: ActivityData,
  network: NetworkType = 'MAINNET',
): Account | null => {
  if (!record) {
    return null;
  }

  const totalPoints = safeBigInt(record.totalPoints);
  const totalMainnetPoints = safeBigInt(record.totalMainnetPoints);
  const totalTestnetPoints = safeBigInt(record.totalTestnetPoints);
  const lastSevenDays = calculateLastSevenDaysPoints(record);
  const badges = determineBadges(activity);
  const activityCounts = calculateActivityCounts(activity);
  const pointsHistory = processPointsHistory(record);

  // updatedAt is a timestamp string from Envio
  const updatedAtTimestamp = record.updatedAt
    ? new Date(Number(record.updatedAt) * 1000)
    : null;

  return {
    id: record.id,
    rank: pageIndex * pageSize + index + 1,
    totalPoints,
    pointsBreakdown: {
      mainnet: totalMainnetPoints,
      testnet: totalTestnetPoints,
      lastSevenDays,
    },
    badges,
    activity: activityCounts,
    pointsHistory,
    updatedAt: Number(record.updatedAt) || 0,
    updatedAtTimestamp,
    network,
  } satisfies Account;
};

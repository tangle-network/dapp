import type { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import type { BadgeEnum } from '../constants';

export interface PointsBreakdown {
  mainnet: bigint;
  testnet: bigint;
  lastSevenDays: bigint;
}

export interface AccountActivity {
  depositCount: number;
  delegationCount: number;
  liquidStakingPoolCount: number;
  blueprintCount: number;
  serviceCount: number;
  jobCallCount: number;
}

export interface PointsHistory {
  blockNumber: number;
  timestamp: number;
  points: bigint;
}

export interface Account {
  id: string;
  rank: number;
  totalPoints: bigint;
  pointsBreakdown: PointsBreakdown;
  badges: BadgeEnum[];
  activity: AccountActivity;
  pointsHistory: PointsHistory[];
  updatedAt: number;
  updatedAtTimestamp: Date | null;
  network: NetworkType;
}

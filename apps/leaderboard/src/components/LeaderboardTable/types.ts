import { BadgeEnum } from './BadgesCell';

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

export interface TestnetTaskCompletion {
  depositedThreeAssets: boolean;
  delegatedAssets: boolean;
  liquidStaked: boolean;
  nominated: boolean;
  nativeRestaked: boolean;
  bonus: boolean;
  completionPercentage: number;
}

export interface PointsHistory {
  blockNumber: number;
  points: bigint;
}

export interface Account {
  id: string;
  totalPoints: bigint;
  pointsBreakdown: PointsBreakdown;
  badges: BadgeEnum[];
  activity: AccountActivity;
  testnetTaskCompletion?: TestnetTaskCompletion;
  pointsHistory: PointsHistory[];
  createdAt: number;
  lastUpdatedAt: number;
}

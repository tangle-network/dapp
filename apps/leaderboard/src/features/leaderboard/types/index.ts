import type { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import type { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
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
  rank: number;
  totalPoints: bigint;
  pointsBreakdown: PointsBreakdown;
  badges: BadgeEnum[];
  activity: AccountActivity;
  testnetTaskCompletion?: TestnetTaskCompletion;
  pointsHistory: PointsHistory[];
  createdAt: number;
  createdAtTimestamp: Date | null | undefined;
  lastUpdatedAt: number;
  lastUpdatedAtTimestamp: Date | null | undefined;
  identity: IdentityType | null | undefined;
  network: NetworkType;
}

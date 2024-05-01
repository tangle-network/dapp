import React from 'react';

export type StatsType =
  | 'Wallet Balance'
  | 'Total Staked'
  | 'Unbonding Amount'
  | 'Total Payout Rewards';

export interface NominatorStatsItemProps {
  title: string;
  type: StatsType;
  tooltip?: string | React.ReactNode;
  address: string;
  className?: string;
}

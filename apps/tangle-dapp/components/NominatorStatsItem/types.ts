export type StatsType =
  | 'Wallet Balance'
  | 'Total Staked'
  | 'Payment Destination'
  | 'Unbonding Amount';

export interface NominatorStatsItemProps {
  title: string;
  type: StatsType;
  tooltip?: string;
  address: string;
  className?: string;
}

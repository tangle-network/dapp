export type StatsType = 'Wallet Balance' | 'Total Staked' | 'Payment Destination';

export interface NominatorStatsItemProps {
  title: string;
  type: StatsType;
  tooltip?: string;
  address: string;
  className?: string;
}

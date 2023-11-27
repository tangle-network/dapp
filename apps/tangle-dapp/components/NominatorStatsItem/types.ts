export type StatsType = 'Wallet Balance' | 'Total Staked';

export interface NominatorStatsItemProps {
  title: string;
  type: StatsType;
  tooltip?: string;
  address: string;
  className?: string;
}

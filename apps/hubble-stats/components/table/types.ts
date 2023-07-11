export interface HeaderCellProps {
  title: string;
  tooltip?: string;
  className?: string;
}

export interface NumberCellProps {
  value?: number;
  prefix?: string;
  suffix?: string;
  isProtected?: boolean;
  className?: string;
}

export type PoolType = 'single' | 'multi';

export interface PoolTypeCellProps {
  type: PoolType;
  className?: string;
}

export interface ShieldedCellProps {
  title: string;
  address: string;
  icon?: JSX.Element;
}

export type ActivityType = 'deposit' | 'transfer' | 'withdraw';

export interface ActivityCellProps {
  txHash: string;
  activity: ActivityType;
}

export interface TimeCellProps {
  time?: number;
  className?: string;
}

export interface DestinationCellProps {
  className?: string;
}

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

export interface ShieldedCellProps {
  title: string;
  address: string;
}

export type ActivityType = 'deposit' | 'transfer' | 'withdraw';

export interface ActivityCellProps {
  activity: ActivityType;
}

export interface TimeCellProps {
  time?: string;
  className?: string;
}

export interface DestinationCellProps {
  className?: string;
}

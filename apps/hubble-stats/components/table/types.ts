export interface HeaderCellProps {
  title: string;
  tooltip?: string;
  className?: string;
}

export interface IconsCellProps {
  type: 'chains' | 'tokens';
  items: string[];
  className?: string;
  iconSize?: number;
}

export interface NumberCellProps {
  value?: number;
  prefix?: string;
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

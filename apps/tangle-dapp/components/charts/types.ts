import type { ServiceType } from '../../types';

export type PirChartTooltipContentProps = {
  name: string;
  value: number;
  suffix?: string;
};

export type PieChartItem = {
  name: string;
  value: number;
  color: string;
};

export interface PieChartProps {
  data: PieChartItem[];
  title?: string;
}

type EarningsByServiceType = Partial<Record<ServiceType, number>>;

export type RoleEarningsChartItem = {
  month: string;
  year: number;
} & EarningsByServiceType;

export interface RoleEarningsChartProps {
  data: RoleEarningsChartItem[];
  unit?: string;
}

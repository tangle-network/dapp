import type { ServiceType } from '../../types';

export type ProportionPieChartItem = {
  name: string;
  value: number;
  color: string;
};

export interface ProportionPieChartProps {
  data: ProportionPieChartItem[];
  title?: string;
  showTotal?: boolean;
  unit?: string;
}

type EarningsByServiceType = Partial<Record<ServiceType, number>>;

export type RoleEarningsChartItem = {
  month: string;
  year: number;
} & EarningsByServiceType;

export interface RoleEarningsChartProps {
  data: RoleEarningsChartItem[];
}

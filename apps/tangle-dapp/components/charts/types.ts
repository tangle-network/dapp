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

export type RoleEarningsChartItem = {
  era: number;
  reward: number;
};

export interface RoleEarningsChartProps {
  data: RoleEarningsChartItem[];
}

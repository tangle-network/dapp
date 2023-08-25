export interface ChartTooltipProps {
  date: Date;
  info: Array<{
    color: string;
    label: string;
    value: number;
    valuePrefix?: string;
    valueSuffix?: string;
  }>;
}

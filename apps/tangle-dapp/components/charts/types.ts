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

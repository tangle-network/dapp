export type ProportionPieChartItem = {
  name: string;
  value: number;
  color: string;
};

export interface ProportionPieChartProps {
  data: ProportionPieChartItem[];
  title?: string;
  calculateTotal?: boolean;
  unit?: string;
}

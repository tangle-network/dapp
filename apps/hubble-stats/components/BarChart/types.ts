export type BarChartProps = {
  data: Array<{
    date: Date;
    value: number;
  }>;
  setValue: (value: number | null) => void;
  setDate: (date: Date | null) => void;
  width?: number | string;
  height?: number | string;
};

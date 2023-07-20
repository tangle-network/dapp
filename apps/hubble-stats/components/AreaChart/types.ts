export type AreaChartProps = {
  data: any;
  setValue: (value: number | null) => void;
  setDate: (date: Date | null) => void;
  isDarkMode: boolean;
  width?: number | string;
  height?: number | string;
};

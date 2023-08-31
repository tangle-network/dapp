export type VolumeChartProps = {
  data: Array<{
    date: Date;
    deposit: number;
    withdrawal: number;
  }>;
  setValue: (value: number | null) => void;
  setDate: (date: Date | null) => void;
  width?: number | string;
  height?: number | string;
};

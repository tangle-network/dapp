interface BasicChartProps {
  data: Array<{
    date: Date;
    value: number;
  }>;
  setValue: (value: number | null) => void;
  setDate: (date: Date | null) => void;
  width?: number | string;
  height?: number | string;
  showTooltip?: boolean;
  tooltipLabel?: string;
  tooltipValuePrefix?: string;
  tooltipValueSuffix?: string;
}

export interface AreaChartProps extends BasicChartProps {}

export interface BarChartProps extends BasicChartProps {
  fillColor?: 'blue' | 'purple';
}

export interface VolumeChartProps
  extends Omit<BasicChartProps, 'data' | 'showTooltip' | 'tooltipLabel'> {
  data: Array<{
    date: Date;
    deposit: number;
    withdrawal: number;
  }>;
}

export interface ChartTooltipContentProps {
  date: Date;
  info: Array<{
    color: string;
    label: string;
    value: number;
    valuePrefix?: string;
    valueSuffix?: string;
  }>;
  /**
   * A function to call when the content of Tooltip is being displayed
   */
  onContentDisplayedFnc: () => void;
}

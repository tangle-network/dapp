export interface ChartProps {
  startingEpoch: number;
  numDatesFromStart: number;
  epochNow: number;
}

export interface PoolChartPropsType extends ChartProps {
  poolAddress: string;
}

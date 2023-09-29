export interface ChartProps {
  startingEpoch: number;
  numDatesFromStart: number;
}

export interface PoolChartPropsType extends ChartProps {
  poolAddress: string;
}

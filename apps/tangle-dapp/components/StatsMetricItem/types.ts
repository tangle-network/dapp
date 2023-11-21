import { StatsMetricReturnType } from '../../types';

export interface StatsMetricItemProps {
  title: string;
  tooltip?: string;
  dataFetcher: (
    address: string | `0x${string}`
  ) => Promise<StatsMetricReturnType>;
  address: string | `0x${string}`;
  className?: string;
}

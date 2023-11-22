import { StatsMetricReturnType } from '../../types';

export interface StatsMetricItemProps {
  title: string;
  tooltip?: string;
  dataFetcher: (address: string) => Promise<StatsMetricReturnType>;
  address: string;
  className?: string;
}

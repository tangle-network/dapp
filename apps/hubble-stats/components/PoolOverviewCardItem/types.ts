import type { MetricType } from '../../types';

export interface PoolOverviewCardItemProps {
  title: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  dataFetcher: () => Promise<MetricType>;
}

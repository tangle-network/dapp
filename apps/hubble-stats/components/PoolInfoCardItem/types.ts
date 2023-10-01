import type { MetricType } from '../../types';

export interface PoolInfoCardItemProps {
  title: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  dataFetcher: () => Promise<MetricType>;
}

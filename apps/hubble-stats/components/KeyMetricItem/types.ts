import type { MetricType } from '../../types';

export interface MetricItemProps {
  title: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  dataFetcher: () => Promise<MetricType>;
}

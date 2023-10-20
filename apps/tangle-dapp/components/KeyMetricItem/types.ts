import { MetricReturnType } from '../../types';

export interface MetricItemProps {
  title: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  dataFetcher: () => Promise<MetricReturnType>;
}

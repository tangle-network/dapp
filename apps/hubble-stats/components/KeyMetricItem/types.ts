import type { MetricType } from '../../types';

export interface MetricItemProps<LoadingType extends boolean> {
  title: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  value: LoadingType extends true ? undefined : MetricType;
  isLoading: LoadingType;
}

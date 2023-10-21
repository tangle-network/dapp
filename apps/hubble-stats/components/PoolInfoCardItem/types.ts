import type { MetricType } from '../../types';

export interface PoolInfoCardItemProps<LoadingType extends boolean> {
  title: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  isLoading: LoadingType;
  value: LoadingType extends true ? undefined : MetricType;
}

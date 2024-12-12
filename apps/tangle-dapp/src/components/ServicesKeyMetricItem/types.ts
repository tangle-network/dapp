import type { IconBase } from '@webb-tools/icons/types';
import { ReactElement } from 'react';

export interface ServicesKeyMetricItemProps {
  title: string;
  Icon: (props: IconBase) => ReactElement;
  isLoading: boolean;
  isError?: boolean;
  value?: number | null;
  changeRate?: number | null;
  className?: string;
}

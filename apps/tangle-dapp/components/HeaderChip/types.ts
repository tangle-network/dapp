import type { IconBase } from '@webb-tools/icons/types';
import type React from 'react';

export interface HeaderChipItemProps {
  Icon: React.ReactElement<IconBase>;
  label: string;
  hasTooltip?: boolean;
  tooltipContent?: string;
  dataFetcher: () => Promise<number | undefined>;
}

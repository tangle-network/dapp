import type { IconBase } from '@webb-tools/icons/types';
import type React from 'react';

export type ChipType = 'ERA' | 'Session';

export interface HeaderChipItemProps {
  Icon: (props: IconBase) => React.JSX.Element;
  label: ChipType;
  hasTooltip?: boolean;
  tooltipContent?: string;
  dataFetcher: () => Promise<number | undefined>;
}

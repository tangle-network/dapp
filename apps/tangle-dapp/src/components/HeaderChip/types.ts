import type { IconBase } from '@webb-tools/icons/types';
import type { ReactElement } from 'react';

export type ChipType = 'ERA' | 'Session';

export interface HeaderChipItemProps {
  Icon: (props: IconBase) => ReactElement;
  label: ChipType;
  hasTooltip?: boolean;
  tooltipContent?: string;
}

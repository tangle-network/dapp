import type { IconBase } from '@webb-tools/icons/types';

export type ChipType = 'ERA' | 'Session';

export interface HeaderChipItemProps {
  Icon: (props: IconBase) => JSX.Element;
  label: ChipType;
  hasTooltip?: boolean;
  tooltipContent?: string;
  dataFetcher: () => Promise<number | undefined>;
}

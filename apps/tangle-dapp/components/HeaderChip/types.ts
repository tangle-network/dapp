import type { IconBase } from '@webb-tools/icons/types';

export interface HeaderChipItemProps {
  Icon: (props: IconBase) => JSX.Element;
  label: string;
  hasTooltip?: boolean;
  tooltipContent?: string;
  dataFetcher: () => Promise<number | undefined>;
}

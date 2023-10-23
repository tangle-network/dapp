import { type IconBase } from '@webb-tools/icons/types';

export interface HeaderChipItemProps<T> {
  Icon: (props: IconBase) => JSX.Element;
  label: string;
  hasTooltip?: boolean;
  tooltipContent?: string;
  isLoading?: boolean;
  value?: T;
}

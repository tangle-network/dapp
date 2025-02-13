import { WebbTypographyVariant } from '@tangle-network/ui-components/typography/types';

export interface HeaderCellProps {
  title: string;
  tooltip?: string;
  className?: string;
  titleVariant?: WebbTypographyVariant;
}

export interface StringCellProps {
  value: string;
  className?: string;
}

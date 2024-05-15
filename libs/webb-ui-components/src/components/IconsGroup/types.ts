import { IconSize } from '@webb-tools/icons/types';

export interface IconsGroupProps {
  type: 'token' | 'chain';
  icons: string[];
  iconSize?: IconSize;
  className?: string;
}

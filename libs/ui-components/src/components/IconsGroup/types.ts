import { IconSize } from '@tangle-network/icons/types';

export interface IconsGroupProps {
  type: 'token' | 'chain';
  icons: string[];
  iconSize?: IconSize;
  className?: string;
}

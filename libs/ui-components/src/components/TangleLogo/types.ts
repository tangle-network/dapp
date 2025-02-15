import { IconBase } from '@tangle-network/icons/types';

/**
 * The Tangle Logo props
 */
export interface TangleLogoProps extends Omit<IconBase, 'size'> {
  /**
   * The logo size
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
}

import { IconBase } from '@webb-tools/icons/types.js';

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

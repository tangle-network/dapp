import { IconBase } from '@webb-tools/icons/types.js';

/**
 * The Logo props
 */
export interface LogoProps extends Omit<IconBase, 'size'> {
  /**
   * The logo size
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
}

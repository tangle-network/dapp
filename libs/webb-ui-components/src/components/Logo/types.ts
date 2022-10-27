import { IconBase } from '@webb-tools/icons/types';

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

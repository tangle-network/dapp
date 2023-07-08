import { IconBase } from '@webb-tools/icons/types';

/**
 * The Logo props
 */
export interface LogoWithoutNameProps extends Omit<IconBase, 'size'> {
  /**
   * The logo size
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
}

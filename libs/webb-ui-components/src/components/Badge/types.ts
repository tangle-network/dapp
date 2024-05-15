import { IconBase } from '@webb-tools/icons/types';
import { PropsOf } from '../../types';

export type BadgeColor = 'green' | 'blue' | 'purple' | 'red' | 'yellow';

export interface BadgeProps extends PropsOf<'svg'> {
  /**
   * The icon to be used in the badge.
   * @default <CheckboxBlankCircleLine />
   */
  icon?: React.ReactElement<IconBase>;

  /**
   * The color of the badge.
   * @default 'blue'
   */
  color?: BadgeColor;
}

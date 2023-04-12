import { PropsOf } from '../../types';

export type IconPlacement = 'start' | 'end' | 'center';

export interface SocialsProps extends PropsOf<'div'> {
  /**
   * The flex box placement of the icons (horizontal)
   */
  iconPlacement?: IconPlacement;

  /**
   * The icon class name (use to override the icon style by tailwind classes)
   */
  iconClassName?: string;
}

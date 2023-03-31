import { PropsOf } from '../../types';

export type IconPlacement = 'start' | 'end' | 'center';

export interface SocialsProps extends PropsOf<'div'> {
  iconPlacement?: IconPlacement;
}

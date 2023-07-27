import { IconBase } from '@webb-tools/icons/types';
import { ComponentPropsWithoutRef } from 'react';
import { PropsOf } from '../../types';
import { Switcher } from '../Switcher';

/**
 * The props for the ToggleCard component
 */
export interface ToggleCardProps extends PropsOf<'div'> {
  /**
   * The icon to display in the card
   */
  Icon?: React.ReactElement<IconBase>;

  /**
   * The title of the card
   */
  title: string;

  /**
   * The id of the card
   * @default to `title` if not provided
   */
  id?: string;

  /**
   * The description of the card
   */
  description?: string;

  /**
   * The tooltip to display on hover
   */
  info?: string | React.ReactElement;

  switcherProps?: ComponentPropsWithoutRef<typeof Switcher>;
}

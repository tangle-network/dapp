import type { IconBase } from '@webb-tools/icons/types';
import { PropsOf, WebbComponentBase } from '../../types';
import { ComponentProps } from 'react';
import { Button } from '../buttons';

export interface BannerPropsType extends WebbComponentBase {
  /**
   * Callback function when the close icon is clicked - this will close the banner
   */
  onClose: PropsOf<'button'>['onClick'];
  /**
   * The button props to pass into the Button component
   */
  buttonProps?: ComponentProps<typeof Button>;
  /**
   * The text to display on the button
   */
  buttonText?: string;
  /**
   * The text to display on the banner
   */
  bannerText: string;
  /**
   * The class name to pass into the button
   */
  buttonClassName?: string;
  /**
   * The icon to be displayed on the left side of the banner
   */
  Icon: (props: IconBase) => JSX.Element;
}

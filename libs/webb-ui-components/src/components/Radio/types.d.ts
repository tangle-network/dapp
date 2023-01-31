import {
  RadioGroupProps as RdxRadioGroupProps,
  RadioGroupItemProps,
  RadioGroupIndicatorProps,
} from '@radix-ui/react-radio-group';

import { PropsOf } from '../../types';

/**
 * The props for the Radio group component.
 */
export interface RadioGroupProps extends RdxRadioGroupProps {}

export interface RadioItemProps extends PropsOf<'div'> {
  /**
   * The id of the radio item.
   */
  id: string;

  /**
   * The value of the radio item.
   */
  value: string;

  /**
   * The children as the label of radio button.
   */
  children?: string;

  /**
   * The object to override the props of the radio item.
   */
  overrideRadixRadioItemProps?: Omit<RadioGroupItemProps, 'value'>;

  /**
   * The object to override the props of the radio indicator.
   */
  overrideRadixRadioIndicatorProps?: RadioGroupIndicatorProps;
}

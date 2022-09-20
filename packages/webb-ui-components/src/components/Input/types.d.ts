import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';
import { EventHandler } from 'react';

type OmittedKeys = 'disabled' | 'required' | 'readOnly' | 'size' | 'onChange';

/**
 * The `Input` component props
 */
export interface InputProps extends WebbComponentBase, Omit<PropsOf<'input'>, OmittedKeys> {
  /**
   * The input id
   */
  id: string;
  /**
   * The native HTML `size` attribute to be passed to the `input`
   */
  htmlSize?: number;
  /**
   * The `required` attribute of input tab
   */
  isRequired?: boolean;
  /**
   *  The `disabled` attribute of input tab
   */
  isDisabled?: boolean;
  /**
   * If `true`, the form control will be readonly
   */
  isReadOnly?: boolean;
  /**
   * If `true`, the input will change to the error state
   */
  isInvalid?: boolean;
  /**
   * The input value, change the value by `onChange` function for controlled component
   */
  value?: string;
  /**
   * The `onChange` function to control the value of the input
   */
  onChange?: (nextValue: string | number) => void;
  /**
   * The error message to be displayed if the input is invalid
   */
  errorMessage?: string;
  /**
   * If added, the input will show an icon before the input value
   * @type React.ReactElement
   */
  leftIcon?: React.ReactElement;
  /**
   * If added, the button will show an icon after the input value
   * @type React.ReactElement
   */
  rightIcon?: React.ReactElement;
  /**
   * If provided, the input will have an debounce time in `ms`
   * @default 0
   */
  debounceTime?: number;
}

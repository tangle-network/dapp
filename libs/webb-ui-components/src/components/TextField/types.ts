import { PropsOf } from '../../types';

export type TextFieldContextValue = {
  /**
   * If `true`, the text field will be disabled.
   */
  isDisabled?: boolean;

  /**
   * If provided, the error message will be displayed
   * with the `TextField` component.
   */
  error?: string;
};

export interface TextFieldRootProps
  extends PropsOf<'div'>,
    TextFieldContextValue {}

export interface TextFieldSlotProps extends PropsOf<'div'> {}

export interface TextFieldInputProps
  extends Omit<PropsOf<'input'>, 'disabled'>,
    TextFieldContextValue {}

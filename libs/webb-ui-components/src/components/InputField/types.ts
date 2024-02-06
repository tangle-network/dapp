import { PropsOf } from '../../types';

export type InputFieldContextValue = {
  /**
   * If `true`, the text field will be disabled.
   */
  isDisabled?: boolean;

  /**
   * If provided, the error message will be displayed
   * with the `InputField` component.
   */
  error?: string;

  /**
   * If `true`, the text field hover style will be disabled.
   */
  isDisabledHoverStyle?: boolean;
};

export interface InputFieldRootProps
  extends PropsOf<'div'>,
    InputFieldContextValue {}

export interface InputFieldSlotProps extends PropsOf<'div'> {}

export interface InputFieldInputProps
  extends Omit<PropsOf<'input'>, 'disabled'>,
    InputFieldContextValue {
  isAddressType?: boolean;
  addressTheme?: 'ethereum' | 'substrate';
}

export interface InputFieldDropdownProps extends PropsOf<'div'> {
  title: string;
  items: string[];
  className?: string;
  selectedItem: string;
  setSelectedItem: (selectedItem: string) => void;
}

import type { ComponentBase } from '../../types';
import type { CheckBoxProps } from '../CheckBox/types';

/**
 * `CheckBoxMenu` component's props
 */
export interface CheckBoxMenuProps extends ComponentBase {
  /**
   * The icon displayed after the text
   */
  icon?: React.ReactElement;

  /**
   * Label
   * */
  label: string | JSX.Element;
  /**
   *
   * */
  checkboxProps?: CheckBoxProps;

  /**
   * Label class name
   * */
  labelClassName?: string;
}

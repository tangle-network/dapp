import type { WebbComponentBase } from '../../types/index.js';
import type { CheckBoxProps } from '../CheckBox/types.js';

/**
 * `CheckBoxMenu` component's props
 */
export interface CheckBoxMenuProps extends WebbComponentBase {
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

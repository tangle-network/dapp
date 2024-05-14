import { CheckBoxProps } from '../CheckBox/types.js';
import { WebbComponentBase } from '../../types/index.js';

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

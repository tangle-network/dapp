import { CheckBoxProps } from '@webb-dapp/webb-ui-components/components/CheckBox/types';
import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

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
}

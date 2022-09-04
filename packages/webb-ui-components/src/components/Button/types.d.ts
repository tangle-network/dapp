import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export type ButtonVariant = 'primary' | 'secondary' | 'utility' | 'link';

export type ButtonSize = 'sm' | 'md';

export type ButtonSpinnerPlacement = 'start' | 'end';

/**
 * The Button component options
 */
export interface ButtonProps extends WebbComponentBase {
  /**
   * If `true`, the button will show a spinner
   */
  isLoading?: boolean;
  /**
   * If `true`, the button will be disabled
   */
  isDisabled?: boolean;
  /**
   * The label to show in the button when `isLoading` is true
   * If no text is passed, it only shows the spinner
   */
  loadingText?: string;
  /**
   * The button variant
   * @default "primary"
   */
  varirant?: ButtonVariant;
  /**
   * If added, the button will show an icon before the button's label
   * @type React.ReactElement
   */
  leftIcon?: React.ReactElement;
  /**
   * If added, the button will show an icon after the button's label
   */
  rightIcon?: React.ReactElement;
  /**
   * The space between the button icon and label, the spacing number will match the spacing in design sytem
   */
  iconSpacing?: number;
  /**
   * Replace the spinner component when `isLoading` is set to `true`
   * @type React.ReactElement
   */
  spinner?: React.ReactElement;
  /**
   * It determines the placement of the spinner when isLoading is true
   * @default "start"
   */
  spinnerPlacement?: ButtonSpinnerPlacement;
  /**
   * The button size
   * @default "md"
   */
  size?: ButtonSize;
}

export interface ButtonSpinnerProps extends WebbComponentBase {
  /**
   * The label to show when `isLoading` is `true`
   */
  label?: string;
  /**
   * The space between icon and label, the spacing number will match the spacing in design sytem
   */
  spacing?: number;
  /**
   * It determines the placement of the spinner when `isLoading` is `true`
   */
  placement?: ButtonSpinnerPlacement;
}

type ButtonContentPickKeys = 'leftIcon' | 'rightIcon' | 'iconSpacing' | 'children';
type ButtonContentProps = Pick<ButtonProps, ButtonContentPickKeys>;

type ButtonTextPickKeys = 'size' | 'variant' | 'darkMode' | 'children' | 'isLoading';
type ButtonTextProps = Pick<ButtonProps, ButtonTextPickKeys>;

type ButtonClassNames = {
  [key in ButtonVariant]: {
    base: {
      common: string;
      hover: string;
      active: string;
      disabled: string;
    };
    sm: string;
    md: string;
  };
};

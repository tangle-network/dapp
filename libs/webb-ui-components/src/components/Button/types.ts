import { IWebbComponentBase, WebbComponentBase } from '../../types';

export type ButtonVariant = 'primary' | 'secondary' | 'utility' | 'link';

export type ButtonSize = 'sm' | 'md';

export type ButtonSpinnerPlacement = 'start' | 'end';

export type OmittedKeys = keyof IWebbComponentBase | 'disabled';

export type ButtonBase = Omit<React.ComponentPropsWithoutRef<'button'>, OmittedKeys>;

export type ButtonType = 'button' | 'reset' | 'submit';

/************************* */
/** `useButtonProps` hook types */
/************************* */
export interface AnchorOptions {
  href?: string;
  rel?: string;
  target?: string;
}

export interface UseButtonPropsOptions extends AnchorOptions {
  type?: ButtonType;
  isDisabled?: boolean;
  onClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>;
  tabIndex?: number;
  tagName?: keyof JSX.IntrinsicElements;
  role?: string;
}

export interface AriaButtonProps {
  type?: ButtonType | undefined;
  disabled: boolean | undefined;
  role?: string;
  tabIndex?: number | undefined;
  href?: string | undefined;
  target?: string | undefined;
  rel?: string | undefined;
  'aria-disabled'?: true | undefined;
  onClick?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export interface UseButtonPropsMetadata {
  tagName: keyof JSX.IntrinsicElements;
}

/************************* */
/** Button components types */
/************************* */

/**
 * The Button component options
 */
export interface ButtonProps extends ButtonBase, IWebbComponentBase {
  /**
   * Control the underlying rendered element directly by passing in a valid
   * component type
   */
  as?: keyof JSX.IntrinsicElements;

  /** Optionally specify an href to render a `<a>` tag styled as a button */
  href?: string | undefined;

  /** Anchor target, when rendering an anchor as a button */
  target?: string | undefined;

  rel?: string | undefined;

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
  variant?: ButtonVariant;

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

  /**
   * If `true`, the button will display as full width
   */
  isFullWidth?: boolean;
}

export interface ButtonSpinnerProps extends WebbComponentBase {
  /**
   * The label to show when `isLoading` is `true`
   */
  label?: string;
  /**
   * It determines the placement of the spinner when `isLoading` is `true`
   */
  placement?: ButtonSpinnerPlacement;
}

type ButtonContentPickKeys = 'leftIcon' | 'rightIcon' | 'children';
export type ButtonContentProps = Pick<ButtonProps, ButtonContentPickKeys>;

type ButtonTextPickKeys = 'size' | 'variant' | 'darkMode' | 'children' | 'isLoading';
export type ButtonTextProps = Pick<ButtonProps, ButtonTextPickKeys>;

export type ButtonClassNames = {
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

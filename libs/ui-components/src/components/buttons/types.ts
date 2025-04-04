import type { WalletConfig } from '@tangle-network/dapp-config/wallets/wallet-config.interface';
import type { StatusIndicatorProps } from '@tangle-network/icons/StatusIndicator/types';
import type { IconBase } from '@tangle-network/icons/types';
import type { HTMLAttributeAnchorTarget, JSXElementConstructor } from 'react';
import type { IComponentBase, PropsOf, ComponentBase } from '../../types';

export type ButtonVariant = 'primary' | 'secondary' | 'utility' | 'link';

export type ButtonSize = 'sm' | 'md';

export type ButtonSpinnerPlacement = 'start' | 'end';

export type OmittedKeys = keyof IComponentBase | 'disabled';

export type ButtonBase = Omit<
  React.ComponentPropsWithoutRef<'button'>,
  OmittedKeys
>;

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
  tagName?: keyof JSX.IntrinsicElements | JSXElementConstructor<any>;
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
  tagName: React.ElementType;
}

/************************* */
/** Button components types */
/************************* */

/**
 * The Button component options
 */
export interface ButtonProps extends ButtonBase, IComponentBase {
  /**
   * Control the underlying rendered element directly by passing in a valid
   * component type
   */
  as?: keyof JSX.IntrinsicElements | JSXElementConstructor<any>;

  /** Optionally specify an href to render a `<a>` tag styled as a button */
  href?: string | undefined;

  /** Anchor target, when rendering an anchor as a button */
  target?: HTMLAttributeAnchorTarget | undefined;

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
   * The label to show in the button when `isLoading` is true.
   *
   * If no value is passed, only the spinner will be shown.
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
  leftIcon?: React.ReactElement<IconBase>;

  /**
   * If added, the button will show an icon after the button's label
   */
  rightIcon?: React.ReactElement<IconBase>;

  /**
   * Replace the spinner component when `isLoading` is set to `true`
   * @type React.ReactElement
   */
  spinner?: React.ReactElement<IconBase>;

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

  /**
   * If `true`, the size of the button will be adjusted to fit the icon based on the variant
   */
  isJustIcon?: boolean;

  /**
   * A tooltip to display when the button is disabled.
   *
   * Useful for explaining why the button is disabled.
   */
  disabledTooltip?: string;
}

export interface ButtonSpinnerProps extends ComponentBase {
  /**
   * Indicates if the button has a label or not
   * @default false
   */
  hasLabel?: boolean;
  /**
   * It determines the placement of the spinner when `isLoading` is `true`
   */
  placement?: ButtonSpinnerPlacement;
}

type ButtonContentPickKeys = 'leftIcon' | 'rightIcon' | 'children' | 'variant';
export type ButtonContentProps = Pick<ButtonProps, ButtonContentPickKeys>;

type ButtonTextPickKeys =
  | 'size'
  | 'variant'
  | 'darkMode'
  | 'children'
  | 'isLoading';
export type ButtonTextProps = Pick<ButtonProps, ButtonTextPickKeys>;

export type ButtonClassNames = {
  [key in ButtonVariant]: {
    base: {
      common: string;
      hover: string;
      active: string;
      disabled: string;
    };
  } & Record<ButtonSize, string>;
};

export type ChainOrTokenButtonProps = PropsOf<'button'> & {
  placeholder?: string;
  iconClassName?: string;
  iconType: 'chain' | 'token';
  displayValue?: string;
  showChevron?: boolean;

  /**
   * The text to display in the button
   */
  value?: string;

  /**
   * The status of the button
   */
  status?: StatusIndicatorProps['variant'];

  /**
   * The className of the chain name
   */
  textClassName?: string;

  /**
   * The className of the dropdown icon
   */
  dropdownClassName?: string;
};

/**
 * The ChainButton component props
 */
export type WalletButtonProps = PropsOf<'button'> & {
  /**
   * The wallet to display in the button
   */
  wallet: WalletConfig;

  /**
   * The current address of the wallet
   */
  address: string;

  /**
   * The name of the account to display
   * prior to the address
   */
  accountName?: string;

  addressClassname?: string;
};

export type LoadingPillStatus = 'success' | 'loading' | 'error';

/**
 * The LoadingPill component props
 */
export type LoadingPillProps = PropsOf<'button'> & {
  /**
   * Status of the pill
   * @default "loading"
   */
  status?: LoadingPillStatus;
};

export interface IconButtonProps extends PropsOf<'button'> {
  tooltip?: string;
}

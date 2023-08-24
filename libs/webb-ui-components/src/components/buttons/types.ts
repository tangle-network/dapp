import { IconBase } from '@webb-tools/icons/types';
import { IWebbComponentBase, PropsOf, WebbComponentBase } from '../../types';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { StatusIndicatorProps } from '@webb-tools/icons/StatusIndicator/types';
import { WalletConfig } from '@webb-tools/dapp-config/wallets/wallet-config.interface';

export type ButtonVariant = 'primary' | 'secondary' | 'utility' | 'link';

export type ButtonSize = 'sm' | 'md';

export type ButtonSpinnerPlacement = 'start' | 'end';

export type OmittedKeys = keyof IWebbComponentBase | 'disabled';

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
  tagName: React.ElementType;
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
}

export interface ButtonSpinnerProps extends WebbComponentBase {
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
    sm: string;
    md: string;
  };
};

/**
 * The ChainButton component props
 */
export type ChainButtonProps = PropsOf<'button'> & {
  /**
   * The chain to display in the button
   */
  chain: ChainConfig;

  /**
   * The status of the chain
   */
  status?: StatusIndicatorProps['variant'];
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

export interface IconButtonProps extends ButtonProps {}

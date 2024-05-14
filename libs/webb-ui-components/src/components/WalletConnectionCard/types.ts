import { Wallet } from '@webb-tools/dapp-config';
import { WalletId } from '@webb-tools/dapp-types';
import { PropsOf } from '../../types/index.js';

/**
 * The wallet connection card props
 */
export interface WalletConnectionCardProps extends PropsOf<'div'> {
  /**
   * Wallet array to render
   */
  wallets: Wallet[];

  /**
   * The wallet id which is being connected.
   * The component will display as connecting wallet state
   */
  connectingWalletId?: WalletId;

  /**
   * The wallet id which is being connected, but failed.
   * The component will display as failed wallet state
   * this has higher precedence than the connecting state
   */
  failedWalletId?: WalletId;

  /**
   * Error message to display when the wallet connection failed
   * @default 'Connection Failed! Please try again.'
   */
  errorMessage?: string;

  /**
   * The error button text to display when the wallet connection failed
   * @default 'Try Again'
   */
  errorBtnText?: string;

  /**
   * The callback which is invoked when the user selects a wallet
   * @example - the bridge-dapp will pass a 'switchChain' call with the wallet selection.
   */
  onWalletSelect?: (selectedWallet: Wallet) => Promise<void> | void;

  /**
   * The callback which is invoked when user hits the close button
   */
  onClose?: PropsOf<'button'>['onClick'];

  /**
   * The URL to download the wallet
   */
  downloadWalletURL?: URL;

  /**
   * The URL to the wallet help page
   */
  getHelpURL?: URL;

  /**
   * The callback which is invoked when user hits the try again button.
   * This button only displays on the failed state
   */
  onTryAgainBtnClick?: PropsOf<'button'>['onClick'];

  /**
   * The default text to display when there's no connection and error yet
   */
  contentDefaultText?: string;
}

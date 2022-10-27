import { PropsOf } from '@webb-dapp/webb-ui-components/types';

/**
 * The wallet id, add a new id when the app supports a new wallet
 */
export type WalletId = 'metamask' | 'walletconnect' | 'polkadot-js' | 'talisman' | 'subwallet';

/**
 * The wallet type
 */
export type WalletType = {
  /**
   * The wallet id
   * @type {WalletId}
   */
  id: WalletId;

  /**
   * The wallet name
   */
  name: string;

  /**
   * The wallet title to display.
   * If not provided, it will use the wallet name to display
   */
  title?: string;

  /**
   * The wallet logo
   */
  logo: React.ReactElement;
};

/**
 * The wallet connection card props
 */
export interface WalletConnectionCardProps extends PropsOf<'div'> {
  /**
   * Wallet array to render
   */
  wallets: WalletType[];

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
   * The callback which is invoked when user hits the close button
   */
  onClose?: PropsOf<'button'>['onClick'];

  /**
   * The callback which is invoked when user hits the download button
   */
  onDownloadBtnClick?: PropsOf<'button'>['onClick'];

  /**
   * The callback which is invoked when user hits the help button
   */
  onHelpBtnClick?: PropsOf<'button'>['onClick'];

  /**
   * The callback which is invoked when user hits the try again button.
   * This button only displays on the failed state
   */
  onTryAgainBtnClick?: PropsOf<'button'>['onClick'];
}

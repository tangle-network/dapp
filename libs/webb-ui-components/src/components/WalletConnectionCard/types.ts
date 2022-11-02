import { Wallet } from '@webb-tools/dapp-config';
import { WalletId } from '@webb-tools/dapp-types';
import { PropsOf } from '../../types';

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
   * The callback which is invoked when the user selects a wallet
   * @example - the bridge-dapp will pass a 'switchChain' call with the wallet selection.
   */
  onWalletSelect: (selectedWallet: Wallet) => Promise<void>;

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

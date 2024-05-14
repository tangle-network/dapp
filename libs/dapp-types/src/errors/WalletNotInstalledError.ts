import { WalletId } from '../WalletId.js';
import { WebbError, WebbErrorCodes } from '../WebbError.js';

class WalletNotInstalledError extends WebbError {
  public walletId: WalletId;

  constructor(walletId: WalletId) {
    switch (walletId) {
      case WalletId.MetaMask:
        super(WebbErrorCodes.MetaMaskExtensionNotInstalled);
        break;
      case WalletId.Rainbow:
        super(WebbErrorCodes.RainbowExtensionNotInstalled);
        break;
      case WalletId.Polkadot:
        super(WebbErrorCodes.PolkadotJSExtensionNotInstalled);
        break;
      case WalletId.SubWallet:
        super(WebbErrorCodes.SubWalletExtensionNotInstalled);
        break;
      case WalletId.Talisman:
        super(WebbErrorCodes.TalismanExtensionNotInstalled);
        break;
      default:
        super(WebbErrorCodes.UnknownWallet);
    }

    this.walletId = walletId;
  }
}

export default WalletNotInstalledError;

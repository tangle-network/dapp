import { Wallet, walletsConfig } from '@webb-tools/dapp-config';
import { WalletId, WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';

export function getWalletByWebbErrorCodes(code: WebbErrorCodes): Wallet {
  switch (code) {
    case WebbErrorCodes.PolkaDotExtensionNotInstalled:
      return walletsConfig[WalletId.Polkadot];

    case WebbErrorCodes.MetaMaskExtensionNotInstalled:
      return walletsConfig[WalletId.MetaMask];

    case WebbErrorCodes.TalismanExtensionNotInstalled:
      return walletsConfig[WalletId.Talisman];

    case WebbErrorCodes.SubWalletExtensionNotInstalled:
      return walletsConfig[WalletId.SubWallet];

    default:
      throw WebbError.from(WebbErrorCodes.UnknownWallet);
  }
}

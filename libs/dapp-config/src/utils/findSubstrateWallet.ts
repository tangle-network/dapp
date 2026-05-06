import type {
  InjectedAccount,
  InjectedExtension,
  Unsubcall,
} from '@polkadot/extension-inject/types';
import { WalletId } from '@tangle-network/dapp-types';
import WalletNotInstalledError from '@tangle-network/dapp-types/errors/WalletNotInstalledError';
import { WALLET_CONFIG } from '../wallets';

function ensureAccountsSubscribe(
  extension: InjectedExtension,
): InjectedExtension {
  // if we don't have an accounts subscriber, create a new extension with the subscriber
  if (!extension.accounts.subscribe) {
    return {
      ...extension,
      accounts: {
        ...extension.accounts,
        subscribe: (
          cb: (accounts: InjectedAccount[]) => void | Promise<void>,
        ): Unsubcall => {
          extension.accounts.get().then(cb).catch(console.error);

          return (): void => {
            // no unsubscribe needed, this is a single-shot
          };
        },
      },
    };
  }

  return extension;
}

/**
 * Find and connect to the substrate wallet
 * @param appName - Name of the application
 * @param walletId - ID of the wallet
 * @returns Injected extension
 * @throws WalletNotInstalledError if the wallet is not installed
 */
async function findSubstrateWallet(
  appName: string,
  walletId: WalletId,
): Promise<InjectedExtension> {
  const walletName = WALLET_CONFIG[walletId].name;
  const extension = window.injectedWeb3?.[walletName];

  if (extension === undefined) {
    throw new WalletNotInstalledError(walletId);
  }

  if (extension.connect !== undefined) {
    const ex = await extension.connect(appName);
    return ensureAccountsSubscribe(ex);
  }

  if (extension.enable !== undefined) {
    const injected = await extension.enable(appName);
    return ensureAccountsSubscribe({
      name: walletName,
      version: extension.version || 'unknown',
      ...injected,
    });
  }

  // Fallback to the old way of enabling all the extensions
  const { web3Enable, web3EnablePromise } = await import(
    '@polkadot/extension-dapp'
  );

  const extensions = await (web3EnablePromise !== null
    ? web3EnablePromise
    : web3Enable(appName));

  const ex = extensions.find((extension) => extension.name === walletName);
  if (ex === undefined) {
    throw new WalletNotInstalledError(walletId);
  }

  // Extension from @polkadot/extension-dapp already check for accounts subscription
  return ex;
}

export default findSubstrateWallet;

import type {
  InjectedAccount,
  InjectedExtension,
  Unsubcall,
} from '@polkadot/extension-inject/types';

export const APP_NAME = 'Tangle dApp';

/**
 * Ensures extension has accounts.subscribe method.
 * Some wallet extensions don't implement subscribe, so we polyfill it
 * by falling back to a one-time get() call.
 */
export const ensureAccountsSubscribe = (
  extension: InjectedExtension,
): InjectedExtension => {
  if (!extension.accounts.subscribe) {
    return {
      ...extension,
      accounts: {
        ...extension.accounts,
        subscribe: (
          cb: (accounts: InjectedAccount[]) => void | Promise<void>,
        ): Unsubcall => {
          extension.accounts.get().then(cb).catch(console.error);
          return Function.prototype as Unsubcall;
        },
      },
    };
  }
  return extension;
};

/**
 * Find and connect to a substrate wallet by name.
 * Supports both connect() and enable() methods for wallet extensions.
 */
export const findSubstrateWallet = async (
  walletName: string,
): Promise<InjectedExtension> => {
  if (typeof window === 'undefined' || !window.injectedWeb3) {
    throw new Error('No wallet extensions detected');
  }

  const extension = window.injectedWeb3[walletName];

  if (extension === undefined) {
    throw new Error(`${walletName} is not installed`);
  }

  if (extension.connect !== undefined) {
    const ex = await extension.connect(APP_NAME);
    return ensureAccountsSubscribe(ex);
  }

  if (extension.enable !== undefined) {
    const injected = await extension.enable(APP_NAME);
    return ensureAccountsSubscribe({
      name: walletName,
      version: extension.version || 'unknown',
      ...injected,
    });
  }

  throw new Error(`${walletName} does not support connect() or enable()`);
};

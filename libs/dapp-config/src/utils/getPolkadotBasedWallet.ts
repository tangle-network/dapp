import type { InjectedExtension } from '@polkadot/extension-inject/types';

async function getPolkadotBasedWallet(
  appName: string,
  extensionName: string,
): Promise<InjectedExtension | undefined> {
  try {
    // Without this, compilation for Next.js dapps fails during
    // pre-rendering due to `window` not being defined. Likely caused
    // by the `@polkadot/extension-dapp` package using `window` in
    // its implementation.
    const { web3Enable } = await import('@polkadot/extension-dapp');

    const extensions = await web3Enable(appName);

    return extensions.find((ex) => ex.name === extensionName);
  } catch (error) {
    console.error('Error getting polkadot based wallet', error);
  }
}

export default getPolkadotBasedWallet;

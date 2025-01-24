import type { InjectedExtension } from '@polkadot/extension-inject/types';
import { web3Enable } from '@polkadot/extension-dapp';

async function getPolkadotBasedWallet(
  appName: string,
  extensionName: string,
): Promise<InjectedExtension | undefined> {
  try {
    const extensions = await web3Enable(appName);

    return extensions.find((ex) => ex.name === extensionName);
  } catch (error) {
    console.error('Error getting polkadot based wallet', error);
  }
}

export default getPolkadotBasedWallet;

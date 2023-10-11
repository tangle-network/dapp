import type { InjectedExtension } from '@polkadot/extension-inject/types';

async function getPolkadotBasedWallet(
  appName: string,
  extensionName: string
): Promise<InjectedExtension | undefined> {
  const { web3Enable } = await import('@polkadot/extension-dapp');
  const extensions = await web3Enable(appName);
  return extensions.find((ex) => ex.name === extensionName);
}

export default getPolkadotBasedWallet;

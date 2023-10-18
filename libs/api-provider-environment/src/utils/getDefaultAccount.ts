import type { InjectedExtension } from '@polkadot/extension-inject/types';
import { Account } from '@webb-tools/abstract-api-provider';
import type { SupportedConnector } from '@webb-tools/dapp-config';
import { PolkadotAccount } from '@webb-tools/polkadot-api-provider/ext-provider/polkadot-accounts';
import { Web3Account } from '@webb-tools/web3-api-provider/ext-provider/web3-accounts';

/**
 * Connect and get the default account the the given wallet provider
 * @param provider the wallet provider to get the default account from
 * @returns the default account from the wallet provider
 */
async function getDefaultAccount(
  provider: SupportedConnector | InjectedExtension
): Promise<Account> {
  if ('accounts' in provider) {
    return getPolkadotAccount(provider);
  }

  return getWeb3Account(provider);
}

export default getDefaultAccount;

async function getWeb3Account(provider: SupportedConnector) {
  await provider.connect();
  const address = await provider.getAccount();
  return new Web3Account({ type: 'json-rpc', address }, address);
}

async function getPolkadotAccount(provider: InjectedExtension) {
  const accounts = await provider.accounts.get();
  return new PolkadotAccount(accounts[0], accounts[0].address);
}

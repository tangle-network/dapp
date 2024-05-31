import type { InjectedExtension } from '@polkadot/extension-inject/types';
import type { Account } from '@webb-tools/abstract-api-provider';
import { PolkadotAccount } from '@webb-tools/polkadot-api-provider/ext-provider/polkadot-accounts';
import { Web3Account } from '@webb-tools/web3-api-provider/ext-provider/web3-accounts';
import type { Connector } from 'wagmi';

/**
 * Connect and get the default account the the given wallet provider
 * @param provider the wallet provider to get the default account from
 * @returns the default account from the wallet provider
 */
async function getDefaultAccount(
  provider: Connector | InjectedExtension,
): Promise<Account> {
  if ('uid' in provider) {
    return getWeb3Account(provider);
  }

  return getPolkadotAccount(provider);
}

export default getDefaultAccount;

async function getWeb3Account(provider: Connector) {
  await provider.connect();
  const addresses = await provider.getAccounts();
  return new Web3Account(
    { type: 'json-rpc', address: addresses[0] },
    addresses[0],
  );
}

async function getPolkadotAccount(provider: InjectedExtension) {
  const accounts = await provider.accounts.get();
  return new PolkadotAccount(accounts[0], accounts[0].address);
}

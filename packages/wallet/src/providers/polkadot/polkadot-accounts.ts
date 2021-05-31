import { Account, AccountsAdapter, PromiseOrT } from '@webb-dapp/wallet/account/Accounts.adapter';
import React from 'react';
import { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types';

export class PolkadotAccount extends Account<InjectedAccount> {
  get avatar(): React.ReactNode {
    return React.createElement('div');
  }

  get name(): string {
    return this.address;
  }
}

export class PolkadotAccounts extends AccountsAdapter<InjectedExtension, InjectedAccount> {
  providerName = 'Polka';

  async accounts() {
    const accounts = await this._inner.accounts.get();
    return accounts.map((account) => new PolkadotAccount(account, account.address));
  }

  get activeOrDefault() {
    return new Promise<PolkadotAccount | null>(async (resolve, reject) => {
      try {
        const accounts = await this._inner.accounts.get();
        const defaultAccount = accounts[0] ? new PolkadotAccount(accounts[0], accounts[0].address) : null;
        resolve(defaultAccount);
      } catch (e) {
        reject(e);
      }
    });
  }

  setActiveAccount(account: Account): PromiseOrT<void> {
    return undefined;
  }
}

import { Account, AccountsAdapter, PromiseOrT } from '@webb-dapp/wallet/account/Accounts.adapter';
import React from 'react';

import { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types';
import IDIcon from '@polkadot/react-identicon';

export class PolkadotAccount extends Account<InjectedAccount> {
  get avatar() {
    return React.createElement('div', null, [
      React.createElement(IDIcon, {
        size: 16,
        value: this.address,
      }),
    ]);
  }

  get name(): string {
    return this.inner.name || this.address;
  }
}

export class PolkadotAccounts extends AccountsAdapter<InjectedExtension, InjectedAccount> {
  providerName = 'Polka';

  async accounts() {
    const accounts = await this._inner.accounts.get();
    return accounts.map((account) => new PolkadotAccount(account, account.address));
  }

  get activeOrDefault() {
    // eslint-disable-next-line no-async-promise-executor
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

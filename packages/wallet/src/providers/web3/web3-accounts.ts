import { Account, AccountsAdapter, PromiseOrT } from '@webb-dapp/wallet/account/Accounts.adapter';
import React from 'react';
import { Eth } from 'web3-eth';

export class Web3Account extends Account<Eth> {
  get avatar(): React.ReactNode {
    return React.createElement('div');
  }

  get name(): string {
    return this.address;
  }
}

export class Web3Accounts extends AccountsAdapter<Eth> {
  providerName = 'Eth';

  async accounts() {
    const accounts = await this._inner.getAccounts();
    return accounts.map((address) => new Web3Account(this.inner, address));
  }

  get activeOrDefault() {
    const defaultAccount = this.inner.defaultAccount;
    return defaultAccount ? new Web3Account(this.inner, defaultAccount) : null;
  }

  setActiveAccount(account: Account): PromiseOrT<void> {
    return undefined;
  }
}

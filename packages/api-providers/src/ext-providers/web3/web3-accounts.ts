// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Eth } from 'web3-eth';

import { Account, AccountsAdapter, PromiseOrT } from '../../account/Accounts.adapter';

export class Web3Account extends Account<Eth> {
  get avatar() {
    return '';
  }

  get name(): string {
    return '';
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setActiveAccount(account: Account): PromiseOrT<void> {
    return undefined;
  }
}

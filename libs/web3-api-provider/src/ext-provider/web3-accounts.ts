// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Account, AccountsAdapter, PromiseOrT } from '@nepoche/abstract-api-provider/account';
import { Eth } from 'web3-eth';

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

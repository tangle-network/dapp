// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Account, AccountsAdapter, PromiseOrT } from '@nepoche/abstract-api-provider/account';

import { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types';

import { isValidAddress } from './is-valid-address';

export class PolkadotAccount extends Account<InjectedAccount> {
  get avatar() {
    return null;
  }

  get name(): string {
    return this.inner.name || this.address;
  }
}

export class PolkadotAccounts extends AccountsAdapter<InjectedExtension, InjectedAccount> {
  providerName = 'Polka';
  private activeAccount: null | PolkadotAccount = null;

  async accounts() {
    const accounts = await this._inner.accounts.get();

    return accounts
      .filter((account) => isValidAddress(account.address))
      .map((account) => new PolkadotAccount(account, account.address));
  }

  get activeOrDefault() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<PolkadotAccount | null>(async (resolve, reject) => {
      try {
        if (this.activeAccount) {
          return resolve(this.activeAccount);
        }

        const accounts = await this._inner.accounts.get();
        const defaultAccount = accounts[0] ? new PolkadotAccount(accounts[0], accounts[0].address) : null;

        resolve(defaultAccount);
      } catch (e) {
        reject(e);
      }
    });
  }

  setActiveAccount(account: PolkadotAccount): PromiseOrT<void> {
    this.activeAccount = account;

    return undefined;
  }
}

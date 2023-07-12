// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { WalletClient, Address } from 'viem';
import {
  Account,
  AccountsAdapter,
  PromiseOrT,
} from '@webb-tools/abstract-api-provider/account';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';

export class Web3Account extends Account<WalletClient['account']> {
  constructor(
    public readonly _inner: WalletClient['account'],
    public readonly address: Address
  ) {
    super(_inner, address);
  }

  get avatar() {
    return '';
  }

  get name(): string {
    return '';
  }
}

export class Web3Accounts extends AccountsAdapter<
  WalletClient,
  WalletClient['account']
> {
  providerName = 'Web3';

  async accounts() {
    const account = this.inner.account;

    if (!account) {
      return [];
    }

    return [new Web3Account(account, account.address)];
  }

  get activeOrDefault() {
    const defaultAccount = this.inner.account;

    return defaultAccount
      ? new Web3Account(defaultAccount, defaultAccount.address)
      : null;
  }

  setActiveAccount(
    nextAccount: Account<WalletClient['account']>
  ): PromiseOrT<void> {
    if (this.activeOrDefault !== nextAccount) {
      throw new WebbError(WebbErrorCodes.NotImplemented);
    }
  }
}

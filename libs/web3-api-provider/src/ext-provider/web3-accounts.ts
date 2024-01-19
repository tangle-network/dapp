// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  Account,
  AccountsAdapter,
  PromiseOrT,
} from '@webb-tools/abstract-api-provider/account';
import ensureHex from '@webb-tools/dapp-config/utils/ensureHex';
import { Address, WalletClient } from 'viem';
import { getAccount } from 'wagmi/actions';

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
    const addresses = await this.inner.getAddresses();

    return addresses.map(
      (address) =>
        new Web3Account(
          { type: 'json-rpc', address } satisfies WalletClient['account'],
          address
        )
    );
  }

  get activeOrDefault() {
    const defaultAccount = getAccount();

    if (!defaultAccount.address) {
      return null;
    }

    return new Web3Account(
      {
        type: 'json-rpc',
        address: defaultAccount.address,
      } satisfies WalletClient['account'],
      defaultAccount.address
    );
  }

  setActiveAccount(nextAccount: Account): PromiseOrT<void> {
    this.inner.account = {
      type: 'json-rpc',
      address: ensureHex(nextAccount.address),
    } satisfies WalletClient['account'];
  }
}

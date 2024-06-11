// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  Account,
  AccountsAdapter,
  type PromiseOrT,
} from '@webb-tools/abstract-api-provider/account';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import type { Address, JsonRpcAccount } from 'viem';
import type { Connector } from 'wagmi';
import { getAccount } from 'wagmi/actions';
export class Web3Account extends Account<JsonRpcAccount> {
  constructor(
    public readonly _inner: JsonRpcAccount,
    public readonly address: Address,
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

export class Web3Accounts extends AccountsAdapter<Connector, JsonRpcAccount> {
  providerName = 'Web3';

  async accounts() {
    const addresses = await this.inner.getAccounts();

    return addresses.map(
      (address) =>
        new Web3Account(
          { type: 'json-rpc', address } satisfies JsonRpcAccount,
          address,
        ),
    );
  }

  get activeOrDefault() {
    const defaultAccount = getAccount(getWagmiConfig());

    if (!defaultAccount.address) {
      return null;
    }

    return new Web3Account(
      {
        type: 'json-rpc',
        address: defaultAccount.address,
      } satisfies JsonRpcAccount,
      defaultAccount.address,
    );
  }

  setActiveAccount(_nextAccount: Account): PromiseOrT<void> {
    return;
  }
}

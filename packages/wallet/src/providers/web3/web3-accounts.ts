import { Account, AccountsAdapter, PromiseOrT } from '@webb-dapp/wallet/account/Accounts.adapter';
import React from 'react';
import { Eth } from 'web3-eth';
import tinycolor from 'tinycolor2';

export class Web3Account extends Account<Eth> {
  get avatar() {
    const color = `#${this.address.slice(-6)}`;
    console.log(color);
    return React.createElement(
      'div',
      {
        style: {
          width: 20,
          height: 20,
          background: color,
          border: `1px solid ${tinycolor(color).lighten(30)}`,
          borderRadius: '50%',
          fontSize: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      [this.address.slice(-2)]
    );
  }

  get name(): string {
    return `${this.address.slice(0, 4)}..${this.address.slice(-4)}`;
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

import { Account, AccountsAdapter, PromiseOrT } from '@webb-dapp/wallet/account/Accounts.adapter';
import React from 'react';
import tinycolor from 'tinycolor2';
import { Eth } from 'web3-eth';

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log('Async: Copying to clipboard was successful!');
    },
    function (err) {
      console.error('Async: Could not copy text: ', err);
    }
  );
}

export class Web3Account extends Account<Eth> {
  get avatar() {
    const color = `#${this.address.slice(-6)}`;
    const address = this.address;
    return React.createElement(
      'div',
      {
        onClick() {
          copyTextToClipboard(address);
        },
        style: {
          cursor: 'copy',
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

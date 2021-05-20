/* eslint-disable sort-keys */
import { WalletConnectLogo } from '@webb-dapp/apps/configs/wallets/logos/WalletConnectLogo';
import React from 'react';

import { web3Enable } from '@polkadot/extension-dapp';
import { MetaMaskLogo } from './logos/MetaMaskLogo';
import { PolkaLogo } from './logos/PolkaLogo';

export interface SupportedWallet {
  logo: React.ComponentType;
  name: string;
  title: string;
  enabled: boolean;
  detect?(): boolean | Promise<boolean>;
}

export const supportedWallets: SupportedWallet[] = [
  {
    logo: PolkaLogo,
    name: 'polkadot-js',
    title: `Polkadot`,
    enabled: true,
    async detect() {
      return true;
    },
  },/*
  {
    logo: MetaMaskLogo,
    name: 'metamask',
    title: `MetaMask`,
    enabled: true,
    detect() {
      const hasWeb3 = typeof (window as any).web3 !== 'undefined';
      if (hasWeb3) {
        return (window as any).web3.__isMetaMaskShim__ as boolean;
      }
      return false;
    },
  },
  {
    logo: WalletConnectLogo,
    name: 'wallet connect',
    title: `Wallet Connect`,
    enabled: true,
    detect() {
      return true;
    },
  },*/
];

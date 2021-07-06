import WalletConnectProvider from '@walletconnect/web3-provider';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { ethers } from 'ethers';
import Web3 from 'web3';
import { AbstractProvider } from 'web3-core';

export interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}
export class Web3Provider {
  constructor(private _inner: Web3) {}

  static get currentProvider() {
    //@ts-ignore
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      //@ts-ignore
      const provider = window.ethereum || window.web3.currentProvider;
      if (provider) {
        return provider;
      }
    }
    throw WebbError.from(WebbErrorCodes.MetaMaskExtensionNotInstalled);
  }

  static async fromExtension() {
    //@ts-ignore
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      //@ts-ignore
      const provider = Web3Provider.currentProvider;
      await provider.enable();
      return new Web3Provider(new Web3(provider));
    }
    throw WebbError.from(WebbErrorCodes.MetaMaskExtensionNotInstalled);
  }

  static fromUri(url: string) {
    const HttpProvider = new Web3.providers.HttpProvider(url);
    const web3 = new Web3(HttpProvider);
    return new Web3Provider(web3);
  }

  static async fromWalletConnectProvider(WCProvider: WalletConnectProvider) {
    await WCProvider.enable();
    const web3 = new Web3((WCProvider as unknown) as any);
    return new Web3Provider(web3);
  }

  get network() {
    return this._inner.eth.net.getId();
  }

  get eth() {
    return this._inner.eth;
  }

  get account() {
    return this._inner.defaultAccount;
  }

  get provider() {
    return this._inner.eth.currentProvider;
  }

  enable() {
    // @ts-ignore
  }

  intoEthersProvider() {
    return new ethers.providers.Web3Provider(this.provider as any, 'any');
  }
  addChain(chainInput: AddEthereumChainParameter) {
    const provider = this._inner.currentProvider as AbstractProvider;
    return provider.request?.({
      method: 'wallet_addEthereumChain',
      params: [chainInput],
    });
  }
}

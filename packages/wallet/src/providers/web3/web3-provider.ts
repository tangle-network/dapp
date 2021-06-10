import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';
import { ethers } from 'ethers';

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
    throw Error('Not provider in window');
  }

  static async fromExtension() {
    //@ts-ignore
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      //@ts-ignore
      const provider = Web3Provider.currentProvider;
      await provider.enable();
      return new Web3Provider(new Web3(provider));
    }
    throw Error('Not provider in window');
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
    return new ethers.providers.Web3Provider(this.provider as any);
  }
}

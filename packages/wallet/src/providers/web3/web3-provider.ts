import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';

export class Web3Provider {
  private constructor(private _inner: Web3) {}

  static fromExtension() {
    //@ts-ignore
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      //@ts-ignore
      return new Web3Provider(new Web3(window.web3.currentProvider));
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
}

// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-ts-comment */

import WalletConnectProvider from '@walletconnect/web3-provider';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import Web3 from 'web3';
import { AbstractProvider } from 'web3-core';

import { hexToU8a } from '@polkadot/util';

import { ProvideCapabilities } from '../../';
import { WebbError, WebbErrorCodes } from '../../webb-error';

export type AddToken = { address: string; symbol: string; decimals: number; image: string };

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

export interface SwitchEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
}

export interface ClientMetaData {
  description: string;
  url: string;
  icons: string[];
  name: string;
}

/**
 * Web3Provider a wrapper class for many views of the web3 provider
 * @param helperApi - An api used to do functionalities other than Web3 Ex: WalletConnect.
 **/
export class Web3Provider<T = unknown> {
  private helperApi: T | null = null;
  private _capabilities: ProvideCapabilities = {
    addNetworkRpc: false,
    hasSessions: false,
    listenForAccountChange: false,
    listenForChainChane: false,
  };

  private constructor(private _inner: Web3, readonly clientMeta: ClientMetaData | null = null) {}

  /**
   * Getter for the web3 provider inject by MetaMask
   **/
  static get currentProvider() {
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      // @ts-ignore
      const provider = window.ethereum || window.web3.currentProvider;

      if (provider) {
        return provider;
      }
    }

    throw WebbError.from(WebbErrorCodes.MetaMaskExtensionNotInstalled);
  }

  /**
   * Initialize web3 provider from extension
   **/
  static async fromExtension() {
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      // @ts-ignore
      const provider = Web3Provider.currentProvider;

      // Enable the api
      await provider.enable();
      await provider.send('eth_requestAccounts', []);
      const web3Provider = new Web3Provider(new Web3(provider), {
        description: 'MetaMask',
        icons: [],
        name: 'MetaMask',
        url: 'https://https://metamask.io',
      });

      web3Provider._capabilities = {
        addNetworkRpc: true,
        hasSessions: false,
        listenForAccountChange: true,
        listenForChainChane: true,
      };

      return web3Provider;
    }

    throw WebbError.from(WebbErrorCodes.MetaMaskExtensionNotInstalled);
  }

  /**
   * Create a web3 provider from url  consuming `HttpProvider`
   **/
  static fromUri(url: string) {
    const HttpProvider = new Web3.providers.HttpProvider(url);
    const web3 = new Web3(HttpProvider);

    return new Web3Provider(web3);
  }

  static async fromWalletConnectProvider(WCProvider: WalletConnectProvider) {
    await WCProvider.enable();
    const web3 = new Web3(WCProvider as unknown as any);
    const web3Provider = new Web3Provider<WalletConnectProvider>(web3, WCProvider.walletMeta);

    web3Provider._capabilities = {
      addNetworkRpc: false,
      hasSessions: true,
      listenForAccountChange: false,
      listenForChainChane: false,
    };
    web3Provider.helperApi = WCProvider;

    return web3Provider;
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

  public get capabilities() {
    return this._capabilities;
  }

  enable() {}

  intoEthersProvider() {
    return new ethers.providers.Web3Provider(this.provider as any, 'any');
  }

  async endSession() {
    try {
      if (this.capabilities.hasSessions) {
        if (this.helperApi instanceof WalletConnectProvider) {
          await this.helperApi.connector.killSession({
            message: 'Session end error',
          });
        }
      }
    } catch (e) {
      throw WebbError.from(WebbErrorCodes.EVMSessionAlreadyEnded);
    }
  }

  addChain(chainInput: AddEthereumChainParameter) {
    const provider = this._inner.currentProvider as AbstractProvider;

    return provider.request?.({
      method: 'wallet_addEthereumChain',
      params: [chainInput],
    });
  }

  switchChain(chainInput: SwitchEthereumChainParameter) {
    const provider = this._inner.currentProvider as AbstractProvider;

    return provider.request?.({
      method: 'wallet_switchEthereumChain',
      params: [chainInput],
    });
  }

  addToken(addTokenInput: AddToken) {
    return (this._inner.currentProvider as AbstractProvider).request?.({
      method: 'wallet_watchAsset',
      params: {
        options: {
          address: addTokenInput.address, // The address that the token is at.
          decimals: addTokenInput.decimals, // The number of decimals in the token
          image: addTokenInput.image, // A string url of the token logo
          symbol: addTokenInput.symbol, // A ticker symbol or shorthand, up to 5 chars.
        },
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
      },
    });
  }

  private get_singable_message(prefix: string, message: `0x${string}`): string {
    const utf8Encode = new TextEncoder();
    const prefixBytes = Array.from(utf8Encode.encode(prefix));
    const messageData = Array.from(hexToU8a(message));
    let size = prefixBytes.length + messageData.length;
    const rev = [];
    while (size > 0) {
      let entry = Buffer.from(`${size % 10}`).readInt8();
      rev.push(entry);
      size /= 10;
      size = Math.floor(size);
    }
    let eth_message = Array.from(utf8Encode.encode('\x19Ethereum Signed Message:\n'));
    const ordered = [...rev].reverse();
    ordered.forEach((entry) => {
      eth_message.push(entry);
    });
    prefixBytes.forEach((entry) => {
      eth_message.push(entry);
    });
    messageData.forEach((entry) => {
      eth_message.push(entry);
    });
    return eth_message.toString();
  }

  private to_ascii_hex(data: `0x${string}`): `0x${string}` {
    const bytes = Array.from(hexToU8a(data));
    const output: number[] = [];
    const pushNibble = (n: number) => {
      if (n < 10) {
        let entry = Buffer.from(`${n}`).readUInt8();
        output.push(entry);
      } else {
        const buf = Buffer.from('a');
        output.push(buf.readInt8() - 10 + n);
      }
    };

    bytes.forEach((byte) => {
      pushNibble(byte / 16);
      pushNibble(byte % 16);
    });
    return `0x${output.toString()}`;
  }

  sign(payload: `0x${string}`, account: string): Promise<string> {
    const prefix = `Pay RUSTs to the TEST account:`;
    const asciiAccount = this.to_ascii_hex(payload);
    console.log({
      accountRaw: hexToU8a(payload),
      asciiAccount: hexToU8a(asciiAccount),
    });
    const message = this.get_singable_message(prefix, asciiAccount);
    return this._inner.eth.personal.sign(message, account, undefined);
  }
}

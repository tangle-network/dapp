// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  Amount,
  Currency,
  WrappingEvent,
  WrapUnwrap,
} from '@webb-tools/abstract-api-provider';
import { FungibleTokenWrapper__factory } from '@webb-tools/contracts';
import { ensureHex } from '@webb-tools/dapp-config';
import { zeroAddress } from '@webb-tools/dapp-types';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  Address,
  getContract,
  GetContractReturnType,
  parseEther,
  PublicClient,
} from 'viem';
import { WebbWeb3Provider } from '../webb-provider';

export type Web3WrapPayload = Amount;

export type Web3UnwrapPayload = Amount;

export class Web3WrapUnwrap extends WrapUnwrap<WebbWeb3Provider> {
  private _currentChainId = new BehaviorSubject<number | null>(null);
  private _event = new Subject<Partial<WrappingEvent>>();

  get subscription(): Observable<Partial<WrappingEvent>> {
    return this._event.asObservable();
  }

  constructor(protected inner: WebbWeb3Provider) {
    super(inner);

    inner
      .getChainId()
      .then((evmChainId) => {
        this._currentChainId.next(
          calculateTypedChainId(ChainType.EVM, evmChainId),
        );
        this._event.next({
          ready: null,
        });
      })
      .catch((e) => {
        throw e;
      });

    inner.on('providerUpdate', ([evmChainId]) => {
      this._currentChainId.next(
        calculateTypedChainId(ChainType.EVM, evmChainId),
      );
      this._event.next({
        stateUpdate: null,
      });
    });
  }

  private get currentChainId() {
    return this._currentChainId.value;
  }

  async canUnwrap(unwrapPayload: Web3UnwrapPayload): Promise<boolean> {
    const { amount } = unwrapPayload;
    const fungibleToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    if (!fungibleToken) {
      return false;
    }

    const webbFungibleToken = this.fungibleTokenwrapper(fungibleToken);
    if (!webbFungibleToken) {
      return false;
    }

    const accounts = await this.inner.accounts.accounts();
    const currentAccount = accounts[0];
    const amountBI = BigInt(amount);

    const fn = async (account: Address, amount: bigint) => {
      const [totalSupply, currentWrappedLiquidity] = await Promise.all([
        webbFungibleToken.read.totalSupply(),
        this.inner.publicClient.getBalance({
          address: webbFungibleToken.address,
        }),
      ]);

      if (totalSupply < amount || currentWrappedLiquidity < amount) {
        // no enough liquidity
        return false;
      }

      const userBalance = await webbFungibleToken.read.balanceOf([account]);

      if (userBalance >= amount) {
        return true;
      }

      return false;
    };

    return fn(currentAccount.address, amountBI);
  }

  async unwrap(unwrapPayload: Web3UnwrapPayload): Promise<string> {
    const { amount: amountNumber } = unwrapPayload;

    const amount = parseEther(String(amountNumber));

    const fungibleToken = this.inner.methods.bridgeApi.getBridge()?.currency;

    if (!fungibleToken) {
      return '';
    }

    const webbFungibleToken = this.fungibleTokenwrapper(fungibleToken);
    if (!webbFungibleToken) {
      return '';
    }

    try {
      const account = this.inner.walletClient.account;
      const { request } = await webbFungibleToken.simulate.unwrap(
        [zeroAddress, amount],
        { account: account?.address },
      );

      const txHash = await this.inner.walletClient.writeContract(request);

      return txHash;
    } catch (e) {
      console.log('error while unwrapping: ', e);

      return '';
    }
  }

  async canWrap(): Promise<boolean> {
    return false;
  }

  async wrap(_wrapPayload: Web3WrapPayload): Promise<string> {
    return zeroAddress;
  }

  private getAddressFromCurrency(currency: Currency): Address | undefined {
    const currentNetwork = this.currentChainId;
    if (!currentNetwork) {
      return;
    }

    const addr = currency.getAddress(currentNetwork);
    if (!addr) {
      return;
    }

    return ensureHex(addr);
  }

  fungibleTokenwrapper(
    currency: Currency,
  ):
    | GetContractReturnType<
        typeof FungibleTokenWrapper__factory.abi,
        PublicClient
      >
    | undefined {
    const address = this.getAddressFromCurrency(currency);

    if (!address) {
      return;
    }

    return getContract({
      address,
      abi: FungibleTokenWrapper__factory.abi,
      client: this.inner.publicClient,
    });
  }
}

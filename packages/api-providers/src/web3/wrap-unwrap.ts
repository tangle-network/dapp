// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import { ContractTransaction } from 'ethers';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import Web3 from 'web3';

import { Amount, Bridge, Currency, MixerSize, WrappingBalance, WrappingEvent, WrapUnwrap } from '../abstracts';
import { WebbGovernedToken, zeroAddress } from '../contracts';
import { WebbCurrencyId, webbCurrencyIdToString } from '../enums';
import { CurrencyType } from '../types/currency-config.interface';
import { WebbWeb3Provider } from './webb-provider';

export type Web3WrapPayload = Amount;
export type Web3UnwrapPayload = Amount;
const defaultBalance: WrappingBalance = {
  balance: '0',
  tokenId: undefined,
};

export class Web3WrapUnwrap extends WrapUnwrap<WebbWeb3Provider> {
  private _balances = new BehaviorSubject<[WrappingBalance, WrappingBalance]>([defaultBalance, defaultBalance]);
  private _liquidity = new BehaviorSubject<[WrappingBalance, WrappingBalance]>([defaultBalance, defaultBalance]);
  private _currentChainId = new BehaviorSubject<number | null>(null);
  private _event = new Subject<Partial<WrappingEvent>>();

  private get config() {
    return this.inner.config;
  }

  get balances(): Observable<[WrappingBalance, WrappingBalance]> {
    return this._balances.asObservable();
  }

  get liquidity(): Observable<[WrappingBalance, WrappingBalance]> {
    return this._liquidity.asObservable();
  }

  get subscription(): Observable<Partial<WrappingEvent>> {
    return this._event.asObservable();
  }

  constructor(protected inner: WebbWeb3Provider) {
    super(inner);

    inner
      .getChainId()
      .then((evmChainId) => {
        this._currentChainId.next(calculateTypedChainId(ChainType.EVM, evmChainId));
        this._event.next({
          ready: null,
        });
      })
      .catch((e) => {
        throw e;
      });

    inner.on('providerUpdate', ([evmChainId]) => {
      this._currentChainId.next(calculateTypedChainId(ChainType.EVM, evmChainId));
      this._event.next({
        stateUpdate: null,
      });
    });
  }

  setGovernedToken(nextToken: WebbCurrencyId | null) {
    this._governedToken.next(nextToken);
    this._event.next({
      governedTokenUpdate: nextToken,
    });
  }

  setWrappableToken(nextToken: WebbCurrencyId | null) {
    this._wrappableToken.next(nextToken);
    this._event.next({
      wrappableTokenUpdate: nextToken,
    });
  }

  getSizes(): Promise<MixerSize[]> {
    return Promise.resolve([]);
  }

  private get currentChainId() {
    return this._currentChainId.value;
  }

  // TODO: Dynamic wrappable currencies
  //
  async getWrappableTokens(governedCurrency?: WebbCurrencyId | null): Promise<WebbCurrencyId[]> {
    if (this.currentChainId) {
      const currenciesOfChain = this.config.chains[this.currentChainId].currencies;
      const wrappableCurrencies = currenciesOfChain.filter((currencyId) => {
        return Currency.isWrappableCurrency(this.inner.config.currencies, currencyId);
      });

      if (governedCurrency) {
        const webbGovernedToken = this.governedTokenwrapper(governedCurrency);

        return wrappableCurrencies.filter((token) => {
          const tokenAddress = this.config.currencies[token].addresses.get(this.currentChainId!)!;

          return webbGovernedToken.canwrap(tokenAddress);
        });
      } else {
        return wrappableCurrencies;
      }
    }

    return [];
  }

  async getGovernedTokens(): Promise<WebbCurrencyId[]> {
    if (this.currentChainId) {
      return Bridge.getTokensOfChain(this.inner.config.currencies, this.currentChainId).map(
        (currency) => currency.view.id
      );
    }

    return [];
  }

  async canUnwrap(unwrapPayload: Web3UnwrapPayload): Promise<boolean> {
    const { amount } = unwrapPayload;
    const governedTokenId = this.governedToken!;
    const webbGovernedToken = this.governedTokenwrapper(governedTokenId);

    const account = await this.inner.accounts.accounts();
    const currentAccount = account[0];

    return webbGovernedToken.canUnwrap(currentAccount.address, Number(amount));
  }

  async unwrap(unwrapPayload: Web3UnwrapPayload): Promise<string> {
    const { amount: amountNumber } = unwrapPayload;

    const governedTokenId = this.governedToken!;
    const wrappableTokenId = this.wrappableToken!;
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');

    const webbGovernedToken = this.governedTokenwrapper(governedTokenId);

    try {
      this.inner.notificationHandler({
        description: `Unwrapping ${amountNumber} of ${webbCurrencyIdToString(
          governedTokenId
        )} to ${webbCurrencyIdToString(wrappableTokenId)}`,
        key: 'unwrap-asset',
        level: 'loading',
        message: 'GovernedTokenwrapper:unwrap',
        name: 'Transaction',
      });
      const tx = await webbGovernedToken.unwrap(
        this.config.currencies[wrappableTokenId].addresses.get(this.currentChainId!)!,
        amount
      );

      await tx.wait();
      this.inner.notificationHandler({
        description: `Unwrapping ${amountNumber} of ${webbCurrencyIdToString(
          governedTokenId
        )} to ${webbCurrencyIdToString(wrappableTokenId)}`,
        key: 'unwrap-asset',
        level: 'success',
        message: 'GovernedTokenwrapper:unwrap',
        name: 'Transaction',
      });

      return tx.hash;
    } catch (e) {
      console.log('error while unwrapping: ', e);
      this.inner.notificationHandler({
        description: `Failed to unwrap ${amountNumber} of ${webbCurrencyIdToString(
          governedTokenId
        )} to ${webbCurrencyIdToString(wrappableTokenId)}`,
        key: 'unwrap-asset',
        level: 'error',
        message: 'GovernedTokenwrapper:unwrap',
        name: 'Transaction',
      });

      return '';
    }
  }

  async canwrap(): Promise<boolean> {
    const governedToken = this.governedToken!;
    const wrappableToken = this.wrappableToken!;
    const webbGovernedToken = this.governedTokenwrapper(governedToken);

    if (this.config.currencies[wrappableToken].type === CurrencyType.NATIVE) {
      return webbGovernedToken.isNativeAllowed();
    } else {
      const tokenAddress = this.config.currencies[governedToken].addresses.get(this.currentChainId!)!;

      return webbGovernedToken.canwrap(tokenAddress);
    }
  }

  async wrap(wrapPayload: Web3WrapPayload): Promise<string> {
    const { amount: amountNumber } = wrapPayload;

    const wrappableTokenId = this.wrappableToken!;
    const governableTokenId = this.governedToken!;
    const webbGovernedToken = this.governedTokenwrapper(governableTokenId);
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');

    try {
      this.inner.notificationHandler({
        description: `Wrapping ${String(amountNumber)} of ${webbCurrencyIdToString(
          wrappableTokenId
        )} to ${webbCurrencyIdToString(governableTokenId)}`,
        key: 'wrap-asset',
        level: 'loading',
        message: 'GovernedTokenwrapper:wrap',
        name: 'Transaction',
      });
      let tx: ContractTransaction;

      // If wrapping an erc20, check for approvals
      if (this.getAddressFromWrapTokenId(wrappableTokenId) !== zeroAddress) {
        const wrappableTokenInstance = ERC20Factory.connect(
          this.getAddressFromWrapTokenId(wrappableTokenId),
          this.inner.getEthersProvider().getSigner()
        );
        const wrappableTokenAllowance = await wrappableTokenInstance.allowance(
          await this.inner.getEthersProvider().getSigner().getAddress(),
          wrappableTokenInstance.address
        );

        if (wrappableTokenAllowance.lt(amount)) {
          this.inner.notificationHandler({
            description: 'Waiting for token approval',
            key: 'waiting-approval',
            level: 'info',
            message: 'Waiting for token approval',
            name: 'Approval',
            persist: true,
          });
          tx = await wrappableTokenInstance.approve(webbGovernedToken.address, amount);
          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }
      }

      tx = await webbGovernedToken.wrap(this.getAddressFromWrapTokenId(wrappableTokenId), amount);
      await tx.wait();
      this.inner.notificationHandler({
        description: `Wrapping ${String(amountNumber)} of ${webbCurrencyIdToString(
          wrappableTokenId
        )} to ${webbCurrencyIdToString(governableTokenId)}`,
        key: 'wrap-asset',
        level: 'success',
        message: 'GovernedTokenwrapper:wrap',
        name: 'Transaction',
      });

      return tx.hash;
    } catch (e) {
      console.log('error while wrapping: ', e);
      this.inner.notificationHandler({
        description: `Failed to wrap ${String(amountNumber)} of ${webbCurrencyIdToString(
          wrappableTokenId
        )} to ${webbCurrencyIdToString(governableTokenId)}`,
        key: 'wrap-asset',
        level: 'error',
        message: 'GovernedTokenwrapper:wrap',
        name: 'Transaction',
      });

      return '';
    }
  }

  private getAddressFromWrapTokenId(id: WebbCurrencyId): string {
    const currentNetwork = this.currentChainId!;
    const address = this.config.currencies[id].addresses.get(currentNetwork)!;

    return address;
  }

  governedTokenwrapper(id: WebbCurrencyId): WebbGovernedToken {
    const contractAddress = this.getAddressFromWrapTokenId(id);

    return new WebbGovernedToken(this.inner.getEthersProvider(), contractAddress);
  }
}

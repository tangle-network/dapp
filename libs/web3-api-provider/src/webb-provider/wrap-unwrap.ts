// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Amount, Currency, WrappingEvent, WrapUnwrap } from '@nepoche/abstract-api-provider';
import { CurrencyType, zeroAddress } from '@nepoche/dapp-types';
import { WebbGovernedToken } from '@nepoche/evm-contracts';
import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import { ContractTransaction } from 'ethers';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import Web3 from 'web3';

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

  private get currentChainId() {
    return this._currentChainId.value;
  }

  async canUnwrap(unwrapPayload: Web3UnwrapPayload): Promise<boolean> {
    const { amount } = unwrapPayload;
    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    if (!governedToken) {
      return false;
    }
    const webbGovernedToken = this.governedTokenwrapper(governedToken);

    const account = await this.inner.accounts.accounts();
    const currentAccount = account[0];

    return webbGovernedToken.canUnwrap(currentAccount.address, Number(amount));
  }

  async unwrap(unwrapPayload: Web3UnwrapPayload): Promise<string> {
    const { amount: amountNumber } = unwrapPayload;

    const amount = Web3.utils.toWei(String(amountNumber), 'ether');
    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    if (!governedToken || !wrappableToken) {
      return '';
    }

    const webbGovernedToken = this.governedTokenwrapper(governedToken);

    try {
      this.inner.notificationHandler({
        description: `Unwrapping ${amountNumber} of ${governedToken.view.name} to
        ${wrappableToken.view.name}`,
        key: 'unwrap-asset',
        level: 'loading',
        message: 'GovernedTokenwrapper:unwrap',
        name: 'Transaction',
      });
      const wrappableTokenAddress = await wrappableToken.getAddress(await this.inner.getChainId());

      if (!wrappableTokenAddress) {
        throw new Error(`No wrappable token address for ${wrappableToken.view.name} on selected chain`);
      }
      const tx = await webbGovernedToken.unwrap(wrappableTokenAddress, amount);

      await tx.wait();
      this.inner.notificationHandler({
        description: `Unwrapping ${amountNumber} of ${governedToken.view.name} to
        ${wrappableToken.view.name}`,
        key: 'unwrap-asset',
        level: 'success',
        message: 'GovernedTokenwrapper:unwrap',
        name: 'Transaction',
      });

      return tx.hash;
    } catch (e) {
      console.log('error while unwrapping: ', e);
      this.inner.notificationHandler({
        description: `Failed to unwrap ${amountNumber} of ${governedToken.view.name} to
        ${wrappableToken.view.name}`,
        key: 'unwrap-asset',
        level: 'error',
        message: 'GovernedTokenwrapper:unwrap',
        name: 'Transaction',
      });

      return '';
    }
  }

  async canWrap(): Promise<boolean> {
    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    if (!governedToken || !wrappableToken) {
      return false;
    }
    const webbGovernedToken = this.governedTokenwrapper(governedToken);

    if (wrappableToken.view.type === CurrencyType.NATIVE) {
      return webbGovernedToken.isNativeAllowed();
    } else {
      const tokenAddress = wrappableToken.getAddress(this.currentChainId!)!;

      return webbGovernedToken.canwrap(tokenAddress);
    }
  }

  async wrap(wrapPayload: Web3WrapPayload): Promise<string> {
    const { amount: amountNumber } = wrapPayload;
    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    if (!governedToken || !wrappableToken) {
      return '';
    }

    const webbGovernedToken = this.governedTokenwrapper(governedToken);
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');

    try {
      this.inner.notificationHandler({
        description: `Wrapping ${amountNumber} of ${wrappableToken.view.name} to
        ${governedToken.view.name}`,
        key: 'wrap-asset',
        level: 'loading',
        message: 'GovernedTokenwrapper:wrap',
        name: 'Transaction',
      });
      let tx: ContractTransaction;

      // If wrapping an erc20, check for approvals
      if (this.getAddressFromCurrency(wrappableToken) !== zeroAddress) {
        const wrappableTokenInstance = ERC20Factory.connect(
          this.getAddressFromCurrency(wrappableToken),
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
            name: 'Transaction',
            persist: true,
          });
          tx = await wrappableTokenInstance.approve(webbGovernedToken.address, amount);
          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }
      }

      tx = await webbGovernedToken.wrap(this.getAddressFromCurrency(wrappableToken), amount);
      await tx.wait();
      this.inner.notificationHandler({
        description: `Wrapping ${amountNumber} of ${wrappableToken.view.name} to
        ${governedToken.view.name}`,
        key: 'wrap-asset',
        level: 'success',
        message: 'GovernedTokenwrapper:wrap',
        name: 'Transaction',
      });

      return tx.hash;
    } catch (e) {
      console.log('error while wrapping: ', e);
      this.inner.notificationHandler({
        description: `Failed to wrap ${amountNumber} of ${wrappableToken.view.name} to
        ${governedToken.view.name}`,
        key: 'wrap-asset',
        level: 'error',
        message: 'GovernedTokenwrapper:wrap',
        name: 'Transaction',
      });

      return '';
    }
  }

  private getAddressFromCurrency(currency: Currency): string {
    const currentNetwork = this.currentChainId!;
    return currency.getAddress(currentNetwork)!;
  }

  governedTokenwrapper(currency: Currency): WebbGovernedToken {
    const contractAddress = this.getAddressFromCurrency(currency);

    return new WebbGovernedToken(this.inner.getEthersProvider(), contractAddress);
  }
}

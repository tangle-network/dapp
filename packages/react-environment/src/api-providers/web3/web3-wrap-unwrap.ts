import {
  ChainId,
  chainsConfig,
  currenciesConfig,
  evmIdIntoChainId,
  WebbCurrencyId,
  webbCurrencyIdToString,
} from '@webb-dapp/apps/configs';
import { WebbGovernedToken, zeroAddress } from '@webb-dapp/contracts/contracts';
import { ERC20__factory } from '@webb-dapp/contracts/types';
import { Bridge, MixerSize } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers';
import { CurrencyType } from '@webb-dapp/react-environment/types/currency-config.interface';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import {
  Amount,
  WrappingBalance,
  WrappingEvent,
  WrapUnWrap,
} from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import { ContractTransaction } from 'ethers';
import React from 'react';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import Web3 from 'web3';

export type Web3WrapPayload = Amount;
export type Web3UnwrapPayload = Amount;
const defaultBalance: WrappingBalance = {
  balance: `0`,
  tokenId: undefined,
};

export class Web3WrapUnwrap extends WrapUnWrap<WebbWeb3Provider> {
  private _balances = new BehaviorSubject<[WrappingBalance, WrappingBalance]>([defaultBalance, defaultBalance]);
  private _liquidity = new BehaviorSubject<[WrappingBalance, WrappingBalance]>([defaultBalance, defaultBalance]);
  private _currentChainId = new BehaviorSubject<ChainId | null>(null);
  private _event = new Subject<Partial<WrappingEvent>>();

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

    inner.getChainId().then((evmChainId) => {
      this._currentChainId.next(evmIdIntoChainId(evmChainId));
      this._event.next({
        ready: null,
      });
    });

    inner.on('providerUpdate', ([evmChainId]) => {
      this._currentChainId.next(evmIdIntoChainId(evmChainId));
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
      const currenciesOfChain = chainsConfig[this.currentChainId].currencies;
      const wrappableCurrencies = currenciesOfChain.filter((currencyId) => {
        return Currency.isWrappableCurrency(currencyId);
      });
      if (governedCurrency) {
        const webbGovernedToken = this.governedTokenWrapper(governedCurrency);
        return wrappableCurrencies.filter((token) => {
          const tokenAddress = currenciesConfig[token].addresses.get(this.currentChainId!)!;
          return webbGovernedToken.canWrap(tokenAddress);
        });
      } else {
        return wrappableCurrencies;
      }
    }
    return [];
  }

  async getGovernedTokens(): Promise<WebbCurrencyId[]> {
    if (this.currentChainId) {
      return Bridge.getTokensOfChain(this.currentChainId).map((currency) => currency.view.id);
    }
    return [];
  }

  async canUnWrap(unwrapPayload: Web3UnwrapPayload): Promise<boolean> {
    const { amount } = unwrapPayload;
    const governedTokenId = this.governedToken!;
    const webbGovernedToken = this.governedTokenWrapper(governedTokenId);

    const account = await this.inner.accounts.accounts();
    const currentAccount = account[0];
    return webbGovernedToken.canUnwrap(currentAccount.address, Number(amount));
  }

  async unwrap(unwrapPayload: Web3UnwrapPayload): Promise<string> {
    const { amount: amountNumber } = unwrapPayload;

    const governedTokenId = this.governedToken!;
    const wrappableTokenId = this.wrappableToken!;
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');

    const webbGovernedToken = this.governedTokenWrapper(governedTokenId);
    let path = {
      method: '',
      section: '',
    };
    try {
      path = {
        method: `unwrap`,
        section: `GovernedTokenWrapper`,
      };
      transactionNotificationConfig.loading?.({
        address: 'recipient',
        key: 'unwrap asset',
        data: React.createElement(
          'p',
          { style: { fontSize: '.9rem' } }, // Matches Typography variant=h6
          `Unwrapping ${String(amountNumber)}  of ${webbCurrencyIdToString(
            governedTokenId
          )}   to  ${webbCurrencyIdToString(wrappableTokenId)}`
        ),
        path,
      });
      const tx = await webbGovernedToken.unwrap(
        currenciesConfig[wrappableTokenId].addresses.get(this.currentChainId!)!,
        amount
      );
      await tx.wait();
      transactionNotificationConfig.finalize?.({
        address: 'recipient',
        key: 'unwrap asset',
        data: undefined,
        path,
      });
      return tx.hash;
    } catch (e) {
      console.log('error while unwrapping: ', e);
      transactionNotificationConfig.failed?.({
        address: 'recipient',
        key: 'unwrap asset',
        data: 'unwrapping failed',
        path,
      });
      return '';
    }
  }

  async canWrap(): Promise<boolean> {
    const governedToken = this.governedToken!;
    const wrappableToken = this.wrappableToken!;
    const webbGovernedToken = this.governedTokenWrapper(governedToken);

    if (currenciesConfig[wrappableToken].type == CurrencyType.NATIVE) {
      return webbGovernedToken.isNativeAllowed();
    } else {
      const tokenAddress = currenciesConfig[governedToken].addresses.get(this.currentChainId!)!;
      return webbGovernedToken.canWrap(tokenAddress);
    }
  }

  async wrap(wrapPayload: Web3WrapPayload): Promise<string> {
    const { amount: amountNumber } = wrapPayload;

    const wrappableTokenId = this.wrappableToken!;
    const governableTokenId = this.governedToken!;
    const webbGovernedToken = this.governedTokenWrapper(governableTokenId);
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');
    let path = {
      method: '',
      section: '',
    };
    try {
      path = {
        method: `wrap`,
        section: `GovernedTokenWrapper`,
      };
      transactionNotificationConfig.loading?.({
        address: 'recipient',
        key: 'wrap asset',
        data: React.createElement(
          'p',
          { style: { fontSize: '.9rem' } }, // Matches Typography variant=h6
          `Wrapping ${String(amountNumber)} of ${webbCurrencyIdToString(wrappableTokenId)} to ${webbCurrencyIdToString(
            governableTokenId
          )}`
        ),
        path,
      });
      console.log('address of token to wrap into webbGovernedToken', this.getAddressFromWrapTokenId(wrappableTokenId));
      let tx: ContractTransaction;
      // If wrapping an erc20, check for approvals
      if (this.getAddressFromWrapTokenId(wrappableTokenId) != zeroAddress) {
        const wrappableTokenInstance = ERC20__factory.connect(
          this.getAddressFromWrapTokenId(wrappableTokenId),
          this.inner.getEthersProvider().getSigner()
        );
        const wrappableTokenAllowance = await wrappableTokenInstance.allowance(
          await this.inner.getEthersProvider().getSigner().getAddress(),
          wrappableTokenInstance.address
        );
        console.log(wrappableTokenAllowance);
        if (wrappableTokenAllowance.lt(amount)) {
          notificationApi.addToQueue({
            message: 'Waiting for token approval',
            variant: 'info',
            key: 'waiting-approval',
            extras: { persist: true },
          });
          tx = await wrappableTokenInstance.approve(webbGovernedToken.address, amount);
          await tx.wait();
          notificationApi.remove('waiting-approval');
        }
      }

      tx = await webbGovernedToken.wrap(this.getAddressFromWrapTokenId(wrappableTokenId), amount);
      await tx.wait();
      transactionNotificationConfig.finalize?.({
        address: 'recipient',
        key: 'wrap asset',
        data: undefined,
        path,
      });
      return tx.hash;
    } catch (e) {
      console.log('error while wrapping: ', e);
      transactionNotificationConfig.failed?.({
        address: 'recipient',
        key: 'wrap asset',
        data: 'wrapping failed',
        path,
      });
      return '';
    }
  }

  private getAddressFromWrapTokenId(id: WebbCurrencyId): string {
    const currentNetwork = this.currentChainId!;
    const address = currenciesConfig[id].addresses.get(currentNetwork)!;
    return address;
  }

  governedTokenWrapper(id: WebbCurrencyId): WebbGovernedToken {
    const contractAddress = this.getAddressFromWrapTokenId(id);
    return new WebbGovernedToken(this.inner.getEthersProvider(), contractAddress);
  }
}

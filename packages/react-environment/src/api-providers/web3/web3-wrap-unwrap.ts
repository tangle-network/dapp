import {
  bridgeConfigByAsset,
  ChainId,
  chainsConfig,
  currenciesConfig,
  evmIdIntoChainId,
  getSupportedCurrenciesOfChain,
  WebbCurrencyId,
  webbCurrencyIdToString,
} from '@webb-dapp/apps/configs';
import { WebbGovernedToken, zeroAddress } from '@webb-dapp/contracts/contracts';
import { Bridge, MixerSize } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers';
import { CurrencyType } from '@webb-dapp/react-environment/types/currency-config.interface';
import {
  Amount,
  WrappingBalance,
  WrappingEvent,
  WrapUnWrap,
} from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import React from 'react';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
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
    merge(
      this.$currentTokenValue.pipe(
        filter((t) => Boolean(t)),
        map((t) => ({
          isCurrent: true,
          value: t,
        }))
      ),
      this.$otherEdgeToken.pipe(
        filter((t) => Boolean(t)),
        map((t) => ({
          isCurrent: false,
          value: t,
        }))
      )
    ).subscribe(async (o) => {
      if (!o.value) {
        return;
      }
      const accounts = await this.inner.accounts.accounts();
      const account = accounts[0];
      const otherValue = this.otherEdgToken;
      const index = o.isCurrent ? 0 : 1;
    });
  }

  getSizes(): Promise<MixerSize[]> {
    return Promise.resolve([]);
  }

  private get currentChainId() {
    return this._currentChainId.value;
  }

  // TODO: Dynamic wrappable currencies
  async getWrappableTokens(): Promise<WebbCurrencyId[]> {
    if (this.currentChainId) {
      return chainsConfig[this.currentChainId].currencies;
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
    const UnwrapTokenId = this.currentToken!;
    const webbGovernedToken = this.governedTokenWrapper(UnwrapTokenId);

    const account = await this.inner.accounts.accounts();
    const currentAccount = account[0];
    return webbGovernedToken.canUnwrap(currentAccount.address, Number(amount));
  }

  async unwrap(unwrapPayload: Web3UnwrapPayload): Promise<string> {
    const { amount: amountNumber } = unwrapPayload;

    const UnwrapTokenId = this.currentToken!;
    const unwrapToken = this.otherEdgToken!;
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');

    const webbGovernedToken = this.governedTokenWrapper(UnwrapTokenId);
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
          `Unwrapping ${String(amountNumber)}  of ${webbCurrencyIdToString(UnwrapTokenId)}   to  ${webbCurrencyIdToString(unwrapToken)}`
        ),
        path,
      });
      const tx = await webbGovernedToken.unwrap(
        currenciesConfig[unwrapToken].addresses.get(this.currentChainId!)!,
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

  async canWrap(wrapPayload: Web3WrapPayload): Promise<boolean> {
    const { amount: amountNumber } = wrapPayload;
    const _toWrap = this.otherEdgToken!;
    const wrapInto = this.currentToken!;
    const webbGovernedToken = this.governedTokenWrapper(wrapInto);
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');

    return webbGovernedToken.canWrap(Number(amount));
  }

  async wrap(wrapPayload: Web3WrapPayload): Promise<string> {
    const { amount: amountNumber } = wrapPayload;

    const toWrap = this.otherEdgToken!;
    const wrapInto = this.currentToken!;
    const webbGovernedToken = this.governedTokenWrapper(wrapInto);
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
          `Wrapping ${String(amountNumber)} of ${webbCurrencyIdToString(toWrap)} to ${webbCurrencyIdToString(wrapInto)}`
        ),
        path,
      });
      console.log('address of token to wrap into webbGovernedToken', currenciesConfig[toWrap].addresses.get(this.currentChainId!)!);
      const tx = await webbGovernedToken.wrap(currenciesConfig[toWrap].addresses.get(this.currentChainId!)!, amount);
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
    console.log(address);
    return address;
  }

  governedTokenWrapper(id: WebbCurrencyId): WebbGovernedToken {
    const contractAddress = this.getAddressFromWrapTokenId(id);
    return new WebbGovernedToken(this.inner.getEthersProvider(), contractAddress);
  }
}

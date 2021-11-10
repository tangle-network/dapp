import { ChainId, evmIdIntoChainId, WebbCurrencyId, webbCurrencyIdToString } from '@webb-dapp/apps/configs';
import { WebbGovernedToken, zeroAddress } from '@webb-dapp/contracts/contracts';
import { Bridge, BridgeConfig, bridgeConfig, BridgeCurrency, MixerSize } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers';
import {
  Amount,
  WrappingBalance,
  WrappingEvent,
  WrappingTokenId,
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

  private bridgeConfig: BridgeConfig = bridgeConfig;
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

  async getContractLiquidity(tokenId: WrappingTokenId) {
    if (tokenId.variant === 'native-token') {
      return null;
    }
    const webbGovernedToken = this.governedTokenWrapper(String(tokenId.id));
    const balance = await webbGovernedToken.contractBalance;
    return {
      balance: balance.toString(),
      tokenId: tokenId,
    };
  }

  async getBalance(tokenId: WrappingTokenId, account: string): Promise<WrappingBalance> {
    if (tokenId.variant === 'native-token') {
      const balance = await this.inner.innerProvider.eth.getBalance(account);
      return {
        balance,
        tokenId: tokenId,
      };
    } else {
      const webbGovernedToken = this.governedTokenWrapper(String(tokenId.id));
      const balance = await webbGovernedToken.getBalanceOf(account);
      return {
        balance: balance.toString(),
        tokenId: tokenId,
      };
    }
  }

  getSizes(): Promise<MixerSize[]> {
    return Promise.resolve([]);
  }

  async getWrappedTokens(): Promise<WrappingTokenId[]> {
    const currentToken = this.currentToken;
    const chainId = this._currentChainId.value;
    if (currentToken && chainId && currentToken?.variant === 'governed-token') {
      const webbGovernedToken = this.governedTokenWrapper(String(currentToken.id));
      const tokens = await webbGovernedToken.tokens;
      return Bridge.getTokensByAddress(this.bridgeConfig, tokens).map((i) => ({
        id: i.name,
        variant: 'governed-token',
      }));
    }
    return [];
  }

  private get currentChainId() {
    return this._currentChainId.value;
  }

  async getNativeTokens(): Promise<WrappingTokenId[]> {
    if (!this._currentChainId) {
      return [];
    }
    const bridgeTokens = Bridge.getTokensOfChain(this.bridgeConfig, this.currentChainId!).filter(
      (currency) => currency.currencyId !== WebbCurrencyId.WEBB
    );
    const nativeTokens = bridgeTokens.reduce<WebbCurrencyId[]>((acc, brideToken) => {
      return acc.includes(brideToken.currencyId) ? acc : [...acc, brideToken.currencyId];
    }, []);
    return nativeTokens.map((i) => ({
      id: i,
      variant: 'native-token',
    }));
  }

  async getGovernedTokens(): Promise<WrappingTokenId[]> {
    if (this.currentChainId) {
      return Bridge.getTokensOfChain(this.bridgeConfig, this.currentChainId!)
        .filter((currency) => currency.currencyId !== WebbCurrencyId.WEBB)
        .map((i) => ({
          id: i.name,
          variant: 'governed-token',
        }));
    }
    return [];
  }

  async canUnWrap(unwrapPayload: Web3UnwrapPayload): Promise<boolean> {
    const { amount } = unwrapPayload;
    const UnwrapTokenId = this.currentToken?.id!;
    const webbGovernedToken = this.governedTokenWrapper(String(UnwrapTokenId));

    const account = await this.inner.accounts.accounts();
    const currentAccount = account[0];
    return webbGovernedToken.canUnwrap(currentAccount.address, Number(amount));
  }

  async unwrap(unwrapPayload: Web3UnwrapPayload): Promise<string> {
    const { amount: amountNumber } = unwrapPayload;

    const UnwrapTokenId = this.currentToken?.id!;
    const unwrapToken = this.otherEdgToken!;
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');

    const webbGovernedToken = this.governedTokenWrapper(String(UnwrapTokenId));
    let path = {
      method: '',
      section: '',
    };
    try {
      if (unwrapToken.variant === 'native-token') {
        path = {
          method: `wrap`,
          section: `GovernedTokenWrapper`,
        };
        transactionNotificationConfig.loading?.({
          address: 'recipient',
          key: 'unwrap asset',
          data: React.createElement(
            'p',
            { style: { fontSize: '.9rem' } }, // Matches Typography variant=h6
            `Unwrapping ${String(amountNumber)}  of ${UnwrapTokenId}   to  ${webbCurrencyIdToString(
              Number(unwrapToken.id)
            )}`
          ),
          path,
        });
        const tx = await webbGovernedToken.unwrap(zeroAddress, amount);
        await tx.wait();
        transactionNotificationConfig.finalize?.({
          address: 'recipient',
          key: 'unwrap asset',
          data: undefined,
          path,
        });
        return tx.hash;
      } else {
        path = {
          method: `wrap`,
          section: `GovernedTokenWrapper`,
        };
        transactionNotificationConfig.loading?.({
          address: 'recipient',
          key: 'unwrap asset',
          data: React.createElement(
            'p',
            { style: { fontSize: '.9rem' } }, // Matches Typography variant=h6
            `Unwrapping ${String(amountNumber)}  of ${UnwrapTokenId}   to  ${unwrapToken.id}`
          ),
          path,
        });
        const tokenAddress = this.getAddressFromWrapTokenId(String(unwrapToken.id));
        const tx = await webbGovernedToken.unwrap(tokenAddress, amount);
        await tx.wait();
        transactionNotificationConfig.finalize?.({
          address: 'recipient',
          key: 'unwrap asset',
          data: undefined,
          path,
        });
        return tx.hash;
      }
    } catch (e) {
      transactionNotificationConfig.failed?.({
        address: 'recipient',
        key: 'wrap asset',
        data: 'wrapping failed',
        path,
      });
      return '';
    }
  }

  async canWrap(wrapPayload: Web3WrapPayload): Promise<boolean> {
    const { amount: amountNumber } = wrapPayload;
    const _toWrap = this.otherEdgToken?.id!;
    const wrapInto = this.currentToken?.id!;
    const webbGovernedToken = this.governedTokenWrapper(String(wrapInto));
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');

    return webbGovernedToken.canWrap(Number(amount));
  }

  async wrap(wrapPayload: Web3WrapPayload): Promise<string> {
    const { amount: amountNumber } = wrapPayload;

    const toWrap = this.otherEdgToken!;
    const wrapInto = this.currentToken?.id!;
    const webbGovernedToken = this.governedTokenWrapper(String(wrapInto));
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');
    let path = {
      method: '',
      section: '',
    };
    try {
      if (toWrap.variant === 'native-token') {
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
            `Wrapping ${String(amountNumber)} of ${webbCurrencyIdToString(Number(toWrap.id))} to ${wrapInto}`
          ),
          path,
        });
        const tx = await webbGovernedToken.wrap(zeroAddress, amount);
        await tx.wait();
        transactionNotificationConfig.finalize?.({
          address: 'recipient',
          key: 'wrap asset',
          data: undefined,
          path,
        });
        return tx.hash;
      } else {
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
            `Wrapping ${String(amountNumber)} of ${wrapInto} to ${wrapInto}`
          ),
          path,
        });
        const tokenAddress = this.getAddressFromWrapTokenId(String(toWrap.id));
        const tx = await webbGovernedToken.wrap(tokenAddress, amount);
        await tx.wait();
        transactionNotificationConfig.finalize?.({
          address: 'recipient',
          key: 'wrap asset',
          data: undefined,
          path,
        });
        return tx.hash;
      }
    } catch (e) {
      transactionNotificationConfig.failed?.({
        address: 'recipient',
        key: 'wrap asset',
        data: 'wrapping failed',
        path,
      });
      return '';
    }
  }

  private getAddressFromWrapTokenId(id: string): string {
    const bridgeCurrency = BridgeCurrency.fromString(id);
    const bridgeEntry = Bridge.getConfigEntry(this.bridgeConfig, bridgeCurrency);
    const currentNetwork = this.currentChainId!;

    return bridgeEntry.tokenAddresses[currentNetwork]!;
  }

  governedTokenWrapper(id: string): WebbGovernedToken {
    const bridgeCurrency = BridgeCurrency.fromString(id);
    const bridgeEntry = Bridge.getConfigEntry(this.bridgeConfig, bridgeCurrency);
    const currentNetwork = this.currentChainId!;

    const contractAddress = bridgeEntry.tokenAddresses[currentNetwork]!;
    return new WebbGovernedToken(this.inner.getEthersProvider(), contractAddress);
  }
}

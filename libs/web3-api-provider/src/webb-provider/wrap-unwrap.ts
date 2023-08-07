// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  Amount,
  Currency,
  WrappingEvent,
  WrapUnwrap,
} from '@webb-tools/abstract-api-provider';
import {
  ERC20__factory,
  FungibleTokenWrapper__factory,
} from '@webb-tools/contracts';
import { ensureHex } from '@webb-tools/dapp-config';
import {
  CurrencyType,
  WebbError,
  WebbErrorCodes,
  zeroAddress,
} from '@webb-tools/dapp-types';
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
          calculateTypedChainId(ChainType.EVM, evmChainId)
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
        calculateTypedChainId(ChainType.EVM, evmChainId)
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

    const wrappableToken = this.inner.state.wrappableCurrency;
    if (!fungibleToken || !wrappableToken) {
      return '';
    }

    const webbFungibleToken = this.fungibleTokenwrapper(fungibleToken);
    if (!webbFungibleToken) {
      return '';
    }

    try {
      this.inner.notificationHandler({
        description: `Unwrapping ${amountNumber} of ${fungibleToken.view.name} to
        ${wrappableToken.view.name}`,
        key: 'unwrap-asset',
        level: 'loading',
        message: 'FungibleTokenwrapper:unwrap',
        name: 'Transaction',
      });
      const wrappableTokenAddress = wrappableToken.getAddress(
        await this.inner.getChainId()
      );

      if (!wrappableTokenAddress) {
        throw new Error(
          `No wrappable token address for ${wrappableToken.view.name} on selected chain`
        );
      }

      const account = this.inner.walletClient.account;
      const { request } = await webbFungibleToken.simulate.unwrap(
        [ensureHex(wrappableTokenAddress), amount],
        { account }
      );

      const txHash = await this.inner.walletClient.writeContract(request);

      this.inner.notificationHandler({
        description: `Unwrapping ${amountNumber} of ${fungibleToken.view.name} to
        ${wrappableToken.view.name}`,
        key: 'unwrap-asset',
        level: 'success',
        message: 'FungibleTokenwrapper:unwrap',
        name: 'Transaction',
      });

      return txHash;
    } catch (e) {
      console.log('error while unwrapping: ', e);
      this.inner.notificationHandler({
        description: `Failed to unwrap ${amountNumber} of ${fungibleToken.view.name} to
        ${wrappableToken.view.name}`,
        key: 'unwrap-asset',
        level: 'error',
        message: 'FungibleTokenwrapper:unwrap',
        name: 'Transaction',
      });

      return '';
    }
  }

  async canWrap(): Promise<boolean> {
    const fungibleToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    if (!fungibleToken || !wrappableToken) {
      return false;
    }
    const webbFungibleToken = this.fungibleTokenwrapper(fungibleToken);
    if (!webbFungibleToken) {
      return false;
    }

    if (wrappableToken.view.type === CurrencyType.NATIVE) {
      return webbFungibleToken.read.isNativeAllowed();
    } else {
      if (!this.currentChainId) {
        return false;
      }

      const tokenAddress = wrappableToken.getAddress(this.currentChainId);
      if (!tokenAddress) {
        return false;
      }

      return webbFungibleToken.read.isValidToken([ensureHex(tokenAddress)]);
    }
  }

  async wrap(wrapPayload: Web3WrapPayload): Promise<string> {
    const { amount: amountNumber } = wrapPayload;
    const fungibleToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    if (!fungibleToken || !wrappableToken) {
      return '';
    }

    const webbFungibleToken = this.fungibleTokenwrapper(fungibleToken);
    if (!webbFungibleToken) {
      return '';
    }

    const wrappableAddress = this.getAddressFromCurrency(wrappableToken);
    if (!wrappableAddress) {
      return '';
    }

    const amount = parseEther(String(amountNumber));

    try {
      this.inner.notificationHandler({
        description: `Wrapping ${amountNumber} of ${wrappableToken.view.name} to
        ${fungibleToken.view.name}`,
        key: 'wrap-asset',
        level: 'loading',
        message: 'FungibleTokenwrapper:wrap',
        name: 'Transaction',
      });

      // If wrapping an erc20, check for approvals
      if (wrappableAddress !== zeroAddress) {
        const wrappableTokenInstance = getContract({
          address: ensureHex(wrappableAddress),
          abi: ERC20__factory.abi,
          publicClient: this.inner.publicClient,
        });

        const account = this.inner.walletClient.account;
        if (!account) {
          throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
        }

        const wrappableTokenAllowance =
          await wrappableTokenInstance.read.allowance([
            account.address,
            wrappableTokenInstance.address,
          ]);

        if (wrappableTokenAllowance < BigInt(amount)) {
          this.inner.notificationHandler({
            description: 'Waiting for token approval',
            key: 'waiting-approval',
            level: 'info',
            message: 'Waiting for token approval',
            name: 'Transaction',
            persist: true,
          });

          const { request } = await wrappableTokenInstance.simulate.approve(
            [webbFungibleToken.address, amount],
            { account }
          );

          await this.inner.walletClient.writeContract(request);

          this.inner.notificationHandler.remove('waiting-approval');
        }
      }

      const { request } = await webbFungibleToken.simulate.wrap([
        wrappableAddress,
        amount,
      ]);

      const txHash = await this.inner.walletClient.writeContract(request);

      this.inner.notificationHandler({
        description: `Wrapping ${amountNumber} of ${wrappableToken.view.name} to
        ${fungibleToken.view.name}`,
        key: 'wrap-asset',
        level: 'success',
        message: 'FungibleTokenwrapper:wrap',
        name: 'Transaction',
      });

      return txHash;
    } catch (e) {
      console.log('error while wrapping: ', e);
      this.inner.notificationHandler({
        description: `Failed to wrap ${amountNumber} of ${wrappableToken.view.name} to
        ${fungibleToken.view.name}`,
        key: 'wrap-asset',
        level: 'error',
        message: 'FungibleTokenwrapper:wrap',
        name: 'Transaction',
      });

      return '';
    }
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
    currency: Currency
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
      publicClient: this.inner.publicClient,
    });
  }
}

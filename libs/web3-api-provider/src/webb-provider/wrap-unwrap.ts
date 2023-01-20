// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  Amount,
  Currency,
  WrappingEvent,
  WrapUnwrap,
} from '@webb-tools/abstract-api-provider';
import { CurrencyType, zeroAddress } from '@webb-tools/dapp-types';
import {
  ERC20__factory as ERC20Factory,
  FungibleTokenWrapper__factory,
} from '@webb-tools/contracts';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import { BigNumberish, ContractTransaction } from 'ethers';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import Web3 from 'web3';

import { WebbWeb3Provider } from '../webb-provider';
import { FungibleTokenWrapper } from '@webb-tools/tokens';

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

    const account = await this.inner.accounts.accounts();
    const currentAccount = account[0];

    const fn = async (account: string, amount: BigNumberish) => {
      const [currentWrappedLiquidity] = await Promise.all([
        webbFungibleToken.contract.totalSupply(),
        webbFungibleToken.contract.provider.getBalance(
          webbFungibleToken.contract.address
        ),
      ]);

      if (
        currentWrappedLiquidity.lt(amount) ||
        currentWrappedLiquidity.lt(amount)
      ) {
        // no enough liquidity
        return false;
      }

      const userBalance = await webbFungibleToken.contract.balanceOf(account);

      if (userBalance.gte(amount)) {
        return true;
      }

      return false;
    };

    return fn(currentAccount.address, Number(amount));
  }

  async unwrap(unwrapPayload: Web3UnwrapPayload): Promise<string> {
    const { amount: amountNumber } = unwrapPayload;

    const amount = Web3.utils.toWei(String(amountNumber), 'ether');
    const fungibleToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    if (!fungibleToken || !wrappableToken) {
      return '';
    }

    const webbFungibleToken = this.fungibleTokenwrapper(fungibleToken);

    try {
      this.inner.notificationHandler({
        description: `Unwrapping ${amountNumber} of ${fungibleToken.view.name} to
        ${wrappableToken.view.name}`,
        key: 'unwrap-asset',
        level: 'loading',
        message: 'FungibleTokenwrapper:unwrap',
        name: 'Transaction',
      });
      const wrappableTokenAddress = await wrappableToken.getAddress(
        await this.inner.getChainId()
      );

      if (!wrappableTokenAddress) {
        throw new Error(
          `No wrappable token address for ${wrappableToken.view.name} on selected chain`
        );
      }
      const tx = await webbFungibleToken.contract.unwrap(
        wrappableTokenAddress,
        amount
      );

      await tx.wait();
      this.inner.notificationHandler({
        description: `Unwrapping ${amountNumber} of ${fungibleToken.view.name} to
        ${wrappableToken.view.name}`,
        key: 'unwrap-asset',
        level: 'success',
        message: 'FungibleTokenwrapper:unwrap',
        name: 'Transaction',
      });

      return tx.hash;
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

    if (wrappableToken.view.type === CurrencyType.NATIVE) {
      return webbFungibleToken.isNativeAllowed();
    } else {
      const tokenAddress = wrappableToken.getAddress(this.currentChainId!)!;

      return webbFungibleToken.canWrap(tokenAddress);
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
    const amount = Web3.utils.toWei(String(amountNumber), 'ether');

    try {
      this.inner.notificationHandler({
        description: `Wrapping ${amountNumber} of ${wrappableToken.view.name} to
        ${fungibleToken.view.name}`,
        key: 'wrap-asset',
        level: 'loading',
        message: 'FungibleTokenwrapper:wrap',
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
          tx = await wrappableTokenInstance.approve(
            webbFungibleToken.contract.address,
            amount
          );
          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }
      }

      tx = await webbFungibleToken.contract.wrap(
        this.getAddressFromCurrency(wrappableToken),
        amount
      );
      await tx.wait();
      this.inner.notificationHandler({
        description: `Wrapping ${amountNumber} of ${wrappableToken.view.name} to
        ${fungibleToken.view.name}`,
        key: 'wrap-asset',
        level: 'success',
        message: 'FungibleTokenwrapper:wrap',
        name: 'Transaction',
      });

      return tx.hash;
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

  private getAddressFromCurrency(currency: Currency): string {
    const currentNetwork = this.currentChainId!;
    return currency.getAddress(currentNetwork)!;
  }

  fungibleTokenwrapper(currency: Currency): FungibleTokenWrapper {
    const contractAddress = this.getAddressFromCurrency(currency);
    const signer = this.inner.getEthersProvider().getSigner();
    const contract = FungibleTokenWrapper__factory.connect(
      contractAddress,
      signer
    );
    return new FungibleTokenWrapper(contract, signer);
  }
}

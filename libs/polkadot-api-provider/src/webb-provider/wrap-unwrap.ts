// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import '@webb-tools/protocol-substrate-types';
import '@webb-tools/api-derive';

import { Amount, WrappingEvent, WrapUnwrap } from '@nepoche/abstract-api-provider/wrap-unwrap';
import { WebbError, WebbErrorCodes } from '@nepoche/dapp-types';
import { BigNumber, ethers } from 'ethers';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { WebbPolkadot } from '../webb-provider';

export type PolkadotWrapPayload = Amount;
export type PolkadotUnwrapPayload = Amount;

export class PolkadotWrapUnwrap extends WrapUnwrap<WebbPolkadot> {
  private _currentChainId = new BehaviorSubject<number | null>(null);
  private _event = new Subject<Partial<WrappingEvent>>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async canWrap(wrapPayload: PolkadotWrapPayload): Promise<boolean> {
    const { amount: amountNumber } = wrapPayload;
    const account = await this.inner.accounts.activeOrDefault!;
    if (!account) {
      return false;
    }
    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency!;
    const wrappableToken = this.inner.state.wrappableCurrency!;
    const bnAmount = ethers.utils.parseUnits(amountNumber.toString(), wrappableToken.getDecimals());
    const chainID = this.inner.typedChainId;
    const governableTokenId = governedToken.getAddress(chainID)!;
    const wrappableTokenId = wrappableToken.getAddress(chainID)!;
    const poolShare = await this.inner.api.query.assetRegistry.assets(governableTokenId);
    const poolShareExistentialBalance = poolShare.unwrap().existentialDeposit.toString();
    const isLocked = poolShare.unwrap().locked.isTrue;
    if (isLocked) {
      return false;
    }
    const userBalance = await this.inner.methods.chainQuery.tokenBalanceByAddress(wrappableTokenId);
    const enoughBalance = bnAmount.lte(BigNumber.from(userBalance));
    if (!enoughBalance) {
      return false;
    }
    const balance = await this.inner.methods.chainQuery.tokenBalanceByAddress(governableTokenId);
    const validBalanceAfterDeposit = bnAmount
      .add(BigNumber.from(balance))
      .gt(BigNumber.from(poolShareExistentialBalance));
    return validBalanceAfterDeposit;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async unwrap(payload: PolkadotUnwrapPayload): Promise<string> {
    const { amount: amountNumber } = payload;
    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency!;
    const wrappableToken = this.inner.state.wrappableCurrency!;
    const bnAmount = ethers.utils.parseUnits(amountNumber.toString(), wrappableToken.getDecimals());
    const chainID = this.inner.typedChainId;
    const governableATreeId = governedToken.getAddress(chainID)!;
    const wrappableTokenId = wrappableToken.getAddress(chainID)!;

    const account = await this.inner.accounts.activeOrDefault!;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }
    const address = account.address;

    try {
      const tx = this.inner.txBuilder.build(
        {
          method: 'unwrap',
          section: 'tokenWrapper',
        },
        [governableATreeId, wrappableTokenId, bnAmount, address]
      );
      const txHash = await tx.call(account.address);
      return txHash;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async wrap(payload: PolkadotWrapPayload): Promise<string> {
    const { amount: amountNumber } = payload;
    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency!;
    const wrappableToken = this.inner.state.wrappableCurrency!;
    const bnAmount = ethers.utils.parseUnits(amountNumber.toString(), wrappableToken.getDecimals());
    const chainID = this.inner.typedChainId;
    const wrappedTokenId = governedToken.getAddress(chainID)!;
    const wrappableTokenId = wrappableToken.getAddress(chainID)!;

    const account = await this.inner.accounts.activeOrDefault!;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }
    const address = account.address;

    try {
      const tx = this.inner.txBuilder.build(
        {
          method: 'wrap',
          section: 'tokenWrapper',
        },
        [wrappableTokenId, wrappedTokenId, bnAmount, address]
      );
      const txHash = await tx.call(account.address);
      return txHash;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async canUnwrap(unwrapPayload: PolkadotUnwrapPayload): Promise<boolean> {
    const { amount: amountNumber } = unwrapPayload;
    const account = await this.inner.accounts.activeOrDefault!;
    if (!account) {
      return false;
    }
    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency!;
    const wrappableToken = this.inner.state.wrappableCurrency!;
    const bnAmount = ethers.utils.parseUnits(amountNumber.toString(), wrappableToken.getDecimals());
    const chainID = this.inner.typedChainId;
    const governableTokenId = governedToken.getAddress(chainID)!;
    const wrappableTokenId = wrappableToken.getAddress(chainID)!;

    const poolShare = await this.inner.api.query.assetRegistry.assets(governableTokenId);
    const _poolShareExistentialBalance = poolShare.unwrap().existentialDeposit.toString();

    const asset = await this.inner.api.query.assetRegistry.assets(wrappableTokenId);
    const assetExistentialBalance = asset.unwrap().existentialDeposit.toString();

    const isLocked = poolShare.unwrap().locked.isTrue;
    if (isLocked) {
      return false;
    }
    const userBalance = await this.inner.methods.chainQuery.tokenBalanceByAddress(governableTokenId);
    const enoughBalance = bnAmount.lte(BigNumber.from(userBalance));
    // User have enough balance to unwrap
    if (!enoughBalance) {
      return false;
    }
    // TODO: Verify if the user balance can go to Zero for poolShare/or below the existential balance
    const balance = await this.inner.methods.chainQuery.tokenBalanceByAddress(wrappableTokenId);
    const validBalanceAfterDeposit = bnAmount.add(BigNumber.from(balance)).gte(BigNumber.from(assetExistentialBalance));
    return validBalanceAfterDeposit;
  }

  get subscription(): Observable<Partial<WrappingEvent>> {
    return this._event.asObservable();
  }
}

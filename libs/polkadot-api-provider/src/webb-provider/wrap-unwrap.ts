// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import '@webb-tools/api-derive';

import {
  Amount,
  WrappingEvent,
  WrapUnwrap,
} from '@webb-tools/abstract-api-provider/wrap-unwrap';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { lastValueFrom, Observable, Subject } from 'rxjs';
import { parseUnits } from 'viem';
import { WebbPolkadot } from '../webb-provider';

export type PolkadotWrapPayload = Amount;
export type PolkadotUnwrapPayload = Amount;

export class PolkadotWrapUnwrap extends WrapUnwrap<WebbPolkadot> {
  private _event = new Subject<Partial<WrappingEvent>>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async canWrap(wrapPayload: PolkadotWrapPayload): Promise<boolean> {
    const { amount: amountNumber } = wrapPayload;
    const account = await this.inner.accounts.activeOrDefault;
    if (!account) {
      return false;
    }
    const fungibleToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;

    if (!fungibleToken || !wrappableToken) {
      return false;
    }

    const bnAmount = parseUnits(
      amountNumber.toString(),
      wrappableToken.getDecimals()
    );
    const chainID = this.inner.typedChainId;
    const fungibleTokenId = fungibleToken.getAddress(chainID);
    const wrappableTokenId = wrappableToken.getAddress(chainID);

    if (!fungibleTokenId || !wrappableTokenId) {
      return false;
    }

    const poolShare = await this.inner.api.query.assetRegistry.assets(
      fungibleTokenId
    );
    const poolShareExistentialBalance = poolShare
      .unwrap()
      .existentialDeposit.toString();
    const isLocked = poolShare.unwrap().locked.isTrue;
    if (isLocked) {
      return false;
    }
    const userBalance = await lastValueFrom(
      this.inner.methods.chainQuery.tokenBalanceByAddress(wrappableTokenId)
    );
    const enoughBalance = bnAmount <= BigInt(userBalance);
    if (!enoughBalance) {
      return false;
    }
    const balance = await lastValueFrom(
      this.inner.methods.chainQuery.tokenBalanceByAddress(fungibleTokenId)
    );

    const validBalanceAfterDeposit =
      bnAmount + BigInt(balance) > BigInt(poolShareExistentialBalance);
    return validBalanceAfterDeposit;
  }

  async unwrap(payload: PolkadotUnwrapPayload): Promise<string> {
    const { amount: amountNumber } = payload;
    const fungibleToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;

    if (!fungibleToken || !wrappableToken) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const bnAmount = parseUnits(
      amountNumber.toString(),
      wrappableToken.getDecimals()
    );
    const chainID = this.inner.typedChainId;
    const governableATreeId = fungibleToken.getAddress(chainID);
    const wrappableTokenId = wrappableToken.getAddress(chainID);

    const account = await this.inner.accounts.activeOrDefault;
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
    const fungibleToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    if (!fungibleToken || !wrappableToken) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const bnAmount = parseUnits(
      amountNumber.toString(),
      wrappableToken.getDecimals()
    );
    const chainID = this.inner.typedChainId;
    const wrappedTokenId = fungibleToken.getAddress(chainID);
    const wrappableTokenId = wrappableToken.getAddress(chainID);

    const account = await this.inner.accounts.activeOrDefault;
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
    const account = await this.inner.accounts.activeOrDefault;
    if (!account) {
      return false;
    }
    const fungibleToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    if (!fungibleToken || !wrappableToken) {
      return false;
    }

    const bnAmount = parseUnits(
      amountNumber.toString(),
      wrappableToken.getDecimals()
    );
    const chainID = this.inner.typedChainId;
    const fungibleTokenId = fungibleToken.getAddress(chainID);
    const wrappableTokenId = wrappableToken.getAddress(chainID);

    if (!fungibleTokenId || !wrappableTokenId) {
      return false;
    }

    const poolShare = await this.inner.api.query.assetRegistry.assets(
      +fungibleTokenId
    );

    if (poolShare.isNone) {
      return false;
    }

    const asset = await this.inner.api.query.assetRegistry.assets(
      wrappableTokenId
    );
    const assetExistentialBalance = asset
      .unwrap()
      .existentialDeposit.toString();

    const isLocked = poolShare.unwrap().locked.isTrue;
    if (isLocked) {
      return false;
    }
    const userBalance = await lastValueFrom(
      this.inner.methods.chainQuery.tokenBalanceByAddress(fungibleTokenId)
    );
    const enoughBalance = bnAmount <= BigInt(userBalance);
    // User have enough balance to unwrap
    if (!enoughBalance) {
      return false;
    }
    // TODO: Verify if the user balance can go to Zero for poolShare/or below the existential balance
    const balance = await lastValueFrom(
      this.inner.methods.chainQuery.tokenBalanceByAddress(wrappableTokenId)
    );

    const validBalanceAfterDeposit =
      bnAmount + BigInt(balance) > BigInt(assetExistentialBalance);
    return validBalanceAfterDeposit;
  }

  get subscription(): Observable<Partial<WrappingEvent>> {
    return this._event.asObservable();
  }
}

// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Observable } from 'rxjs';

import { WrapUnwrap } from '../abstracts';
import { WebbCurrencyId } from '../enums';
import { Amount, MixerSize, WrappingBalance, WrappingEvent } from '../';
import { WebbPolkadot } from './webb-provider';

export class PolkadotWrapUnwrap extends WrapUnwrap<WebbPolkadot> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canwrap(wrapPayload: any): Promise<boolean> {
    return Promise.resolve(false);
  }

  getSizes(): Promise<MixerSize[]> {
    return Promise.resolve([]);
  }

  getTokensAddress(): Promise<string> {
    return Promise.resolve('');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unwrap(unwrapPayload: any): Promise<string> {
    return Promise.resolve('');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wrap(wrapPayload: any): Promise<string> {
    return Promise.resolve('');
  }

  get balances(): Observable<[WrappingBalance, WrappingBalance]> {
    return new Observable();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canUnwrap(unwrapPayload: Amount): Promise<boolean> {
    return Promise.resolve(false);
  }

  getGovernedTokens(): Promise<WebbCurrencyId[]> {
    return Promise.resolve([]);
  }

  getWrappableTokens(): Promise<WebbCurrencyId[]> {
    return Promise.resolve([]);
  }

  getWrappedTokens(): Promise<WebbCurrencyId[]> {
    return Promise.resolve([]);
  }

  get liquidity(): Observable<[WrappingBalance, WrappingBalance]> {
    return new Observable();
  }

  get subscription(): Observable<Partial<WrappingEvent>> {
    return new Observable();
  }
}

// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { WrapUnwrap } from '../abstracts';
import { Amount, CurrencyType, WrappingEvent } from '../';
import { WebbPolkadot } from './webb-provider';

export class PolkadotWrapUnwrap extends WrapUnwrap<WebbPolkadot> {
  private _currentChainId = new BehaviorSubject<number | null>(null);
  private _event = new Subject<Partial<WrappingEvent>>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async canWrap(wrapPayload: any): Promise<boolean> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unwrap(unwrapPayload: any): Promise<string> {
    return Promise.resolve('');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wrap(wrapPayload: any): Promise<string> {
    return Promise.resolve('');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canUnwrap(unwrapPayload: Amount): Promise<boolean> {
    return Promise.resolve(false);
  }

  get subscription(): Observable<Partial<WrappingEvent>> {
    return this._event.asObservable();
  }
}

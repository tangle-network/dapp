// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Observable } from 'rxjs';

import { WrapUnwrap } from '../abstracts';
import { Amount, WrappingEvent } from '../';
import { WebbPolkadot } from './webb-provider';

export class PolkadotWrapUnwrap extends WrapUnwrap<WebbPolkadot> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canWrap(wrapPayload: any): Promise<boolean> {
    return Promise.resolve(false);
  }

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
    return new Observable();
  }
}

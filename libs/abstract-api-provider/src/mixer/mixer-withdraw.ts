// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';

import { WebbApiProvider } from '../../';
import { TransactionState, WebbWithdrawEvents } from '../transaction';

export type CancelToken = {
  cancelled: boolean;
};

/**
 * Mixer withdraw abstract
 * The underlying method should be implemented to  get a functioning mixerWithdraw for a `WebbApiProvider`
 * @param T - the provider WebbApiProvider
 */
export abstract class MixerWithdraw<T extends WebbApiProvider<any>> extends EventBus<WebbWithdrawEvents> {
  state: TransactionState = TransactionState.Ideal;
  cancelToken: CancelToken = { cancelled: false };

  constructor(protected inner: T) {
    super();
  }

  /**
   *  cancel the withdraw */
  cancelWithdraw(): Promise<void> {
    this.cancelToken.cancelled = true;
    this.emit('stateChange', TransactionState.Cancelling);

    return Promise.resolve(undefined);
  }

  /**
   * This should be implemented to do the Transaction call for the withdraw
   * it should do the side effects on the instance
   * - Mutate the `loading` status of the instance
   * - Use the event bus to emit the status of the transaction
   * - Switch logic for relayer usage
   **/
  abstract withdraw(note: string, recipient: string): Promise<string>;
}

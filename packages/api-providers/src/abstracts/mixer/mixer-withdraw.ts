// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';

import { WebbApiProvider } from '../../';

export enum WithdrawState {
  Cancelling, // Withdraw canceled
  Ideal, // initial status where the instance is Idea and ready for a withdraw

  GeneratingZk, // There is a withdraw in progress, and it's on the step of generating the Zero-knowledge proof

  SendingTransaction, // There is a withdraw in progress, and it's on the step Sending the Transaction whether directly or through relayers

  Done, // the withdraw is Done and succeeded, the next tic the instance should be ideal
  Failed, // the withdraw is Done with a failure, the next tic the instance should be ideal
}

// Events that can be emitted using the {EventBus}
export type WebbWithdrawEvents = {
  // Generic Error by the provider or doing an intermediate step
  error: string;
  // Validation Error for the withdrawing note
  // TODO : update this to be more verbose and not just relate to the note but also the params for `generateNote` and `withdraw`
  validationError: {
    note: string;
    recipient: string;
  };
  // The instance State change event to track the current status of the instance
  stateChange: WithdrawState;
  // the instance is ready
  ready: void;
  loading: boolean;
};

export type CancelToken = {
  cancelled: boolean;
};

/**
 * Mixer withdraw abstract
 * The underlying method should be implemented to  get a functioning mixerWithdraw for a `WebbApiProvider`
 * @param T - the provider WebbApiProvider
 */
export abstract class MixerWithdraw<T extends WebbApiProvider<any>> extends EventBus<WebbWithdrawEvents> {
  state: WithdrawState = WithdrawState.Ideal;
  cancelToken: CancelToken = { cancelled: false };

  constructor(protected inner: T) {
    super();
  }

  /**
   *  cancel the withdraw */
  cancelWithdraw(): Promise<void> {
    this.cancelToken.cancelled = true;
    this.emit('stateChange', WithdrawState.Cancelling);

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

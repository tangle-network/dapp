// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-core';

import { BridgeConfig, CancelToken, DespotStates, WebbWithdrawEvents, WithdrawState } from '../..';
import { MixerSize } from '../../abstracts';
import { DepositPayload } from '../mixer/mixer-deposit';
import { WebbApiProvider } from '../webb-provider.interface';
import { AnchorApi } from './anchor-api';

// Todo: should we extract the interface of MixerDeposit on another class and rename `generateBridgeNote` to generate note
export type VAnchorSize = Omit<MixerSize, 'amount'>;
/**
 * Anchor deposit abstract interface as fixed anchor share similar functionality as the mixer
 * The interface looks the same but there's a different function for note Generation
 **/
export abstract class VAnchorDeposit<
  T extends WebbApiProvider<any>,
  K extends DepositPayload = DepositPayload<any>
> extends EventBus<WebbWithdrawEvents> {
  state: WithdrawState = WithdrawState.Ideal;
  cancelToken: CancelToken = { cancelled: false };

  constructor(protected inner: T) {
    super();
  }

  /**
   * Note generate step this should be called to get the payload `K`
   * The implementation of the function will be responsible for consuming the  provider
   * and the params `mixerId`,`chainId` to generate the wright deposit note and the Payload `k`
   * the mixerId is passed as a param but the list of mixerId's is got via the `getSizes` call
   **/
  generateNote(vanchorId: number | string): Promise<K> {
    throw new Error('api not ready ' + vanchorId);
  }

  /**
   * The deposit call it should receive the payload of type `K`
   * The implementation should
   * - Mutate the `loading` status of the instance
   * - Use the event bus to emit the status of the transaction
   **/
  // TODO: update the impls to return the TX hash instead of void
  abstract deposit(depositPayload: K): Promise<Note>;

  // The current instance status
  loading: DespotStates = 'ideal';

  // Get mixer sizes for display and selection
  abstract getSizes(): Promise<MixerSize[]>;

  protected get bridgeApi() {
    return this.inner.methods.anchorApi as AnchorApi<T, BridgeConfig>;
  }

  protected get config() {
    return this.inner.config;
  }

  cancelDeposit(): Promise<void> {
    this.cancelToken.cancelled = true;
    this.emit('stateChange', WithdrawState.Cancelling);

    return Promise.resolve(undefined);
  }

  /** For the VAnchor, a bridge note represents a UTXO.
   ** @param anchorId - an address or tree id.
   ** @param destination - the chainIdType of the destination chain
   ** @param amount - the amount to be controlled by the generated UTXO
   ** @param wrappableAssetAddress - identifier to determine if wrapping needs to occur in deposit flow.
   */
  abstract generateBridgeNote(
    anchorId: number | string,
    destination: number,
    amount: number,
    wrappableAssetAddress?: string
  ): Promise<K>;
}

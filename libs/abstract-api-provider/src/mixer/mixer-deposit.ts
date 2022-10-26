// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { WebbApiProvider } from '@nepoche/abstract-api-provider';
import { EventBus } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-core';

export type DepositPayload<T extends Note = Note, DepositParams = unknown> = {
  note: T;
  params: DepositParams;
};
export type MixerDepositEvents = {
  error: string;
  ready: undefined;
};
export type DepositStates = 'ideal' | 'generating-note' | 'depositing';

export type MixerSize = {
  id: number | string;
  treeId?: string | number;
  title: string;
  amount: number;
  asset: string;
};

/**
 * Mixer deposit abstract*
 * The underlying method should be implemented to  get a functioning mixerDeposit for a `WebbApiProvider`
 * @param  T - the provider `WebbApiProvider`
 */
export abstract class MixerDeposit<
  T extends WebbApiProvider<any> = WebbApiProvider<any>,
  K extends DepositPayload = DepositPayload<any>
> extends EventBus<MixerDepositEvents> {
  constructor(protected inner: T) {
    super();
  }

  /**
   * Note generate step this should be called to get the payload `K`
   * The implementation of the function will be responsible for consuming the  provider
   * and the params `mixerId`,`chainId` to generate the wright deposit note and the Payload `k`
   * the mixerId is passed as a param but the list of mixerId's is got via the `getSizes` call
   * @param mixerId - Mixer size identifier
   * @param chainId - optional chainId
   **/
  abstract generateNote(mixerId: number | string, chainId?: number | string): Promise<K>;

  /**
   * The deposit call it should receive the payload of type `K`
   * The implementation should
   * - Mutate the `loading` status of the instance
   * - Use the event bus to emit the status of the transaction
   **/
  // TODO: update the impls to return the TX hash instead of void
  abstract deposit(depositPayload: K): Promise<void>;

  // The current instance status
  loading: DepositStates = 'ideal';

  // Get mixer sizes for display and selection
  abstract getSizes(): Promise<MixerSize[]>;
}

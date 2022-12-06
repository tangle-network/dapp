// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { WebbApiProvider } from '../webb-provider.interface';

import { EventBus } from '@webb-tools/app-util';

import { Note } from '@webb-tools/sdk-core';
import { NewNotesTxResult } from '..';
import { CancellationToken } from '../cancelation-token';
import { TransactionState, WebbWithdrawEvents } from '../transaction';
import { Chain } from '@webb-tools/dapp-config';

/**
 * The VAnchorInputPayload describes the information required when a transaction is made
 * on the VAnchor.
 * @param inputNotes - Each inputNote identifies a spendable deposit in a particular vanchor.
 *                     They should be configured with the spender's private keypair.
 *                     These inputNotes should represent the available amount to transfer.
 * @param targetIntance - The VAnchor contract address in solidity, MerkleTree instance for substrate, etc.
 * @param recipient - The public key used in the circuit: published in a registry or poseidon(privKey).
 * @param amount - the amount that will actually be transferred to the recipient. Denoted in BigNumber units.
 * @param activeChain - the current active chain.
 */
export interface VanchorTransferPayload {
  inputNotes: Note[];
  targetTypedChainId: number;
  recipient: string;
  amount: string;
  activeChain?: Chain;
}

export abstract class VAnchorTransfer<
  T extends WebbApiProvider<any>
> extends EventBus<WebbWithdrawEvents> {
  state: TransactionState = TransactionState.Ideal;
  cancelToken: CancellationToken = new CancellationToken();

  constructor(protected inner: T) {
    super();
  }

  cancel(): Promise<void> {
    this.cancelToken.cancel();
    this.emit('stateChange', TransactionState.Cancelling);

    return Promise.resolve(undefined);
  }

  /**
   * @param notes - an array of notes which should be spent for the transfer.
   *                the array may be empty, which would indicate a 'deposit and transfer' flow.
   * @param recipient - An identifier for the recipient.
   * @param amount - the amount to transfer.
   * @param destination - the destination typedChainId.
   */
  abstract transfer(
    transferData: VanchorTransferPayload
  ): PromiseLike<NewNotesTxResult>;
}

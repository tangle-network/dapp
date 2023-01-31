// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { WebbApiProvider } from '../webb-provider.interface';

import { EventBus, LoggerService } from '@webb-tools/app-util';
import { Keypair, Note, Utxo } from '@webb-tools/sdk-core';
import { ZkComponents } from '@webb-tools/utils';
import { BigNumberish, ContractReceipt } from 'ethers';
import { CancellationToken } from '../cancelation-token';
import {
  ActionEvent,
  NewNotesTxResult,
  Transaction,
  TransactionState,
} from '../transaction';

export abstract class AbstractState<
  T extends WebbApiProvider<any>
> extends EventBus<ActionEvent> {
  state: TransactionState = TransactionState.Ideal;
  cancelToken: CancellationToken = new CancellationToken();

  constructor(protected inner: T) {
    super();
  }

  cancel(): Promise<void> {
    this.cancelToken.cancel();
    this.state = TransactionState.Cancelling;
    this.emit('stateChange', TransactionState.Cancelling);

    return Promise.resolve(undefined);
  }

  change(state: TransactionState): void {
    this.state = state;
    this.emit('stateChange', state);
  }
}

export abstract class VAnchorActions<
  T extends WebbApiProvider<any> = WebbApiProvider<any>
> extends AbstractState<T> {
  logger: LoggerService = LoggerService.new(`${this.inner.type}VAnchorActions`);

  // A function to check if the (account, public key) pair is registered.
  abstract isPairRegistered(
    target: string,
    account: string,
    pubkey: string
  ): Promise<boolean>;

  // A function to register an account. It will return true if the account was registered, and false otherwise.
  abstract register(
    target: string,
    account: string,
    pubkey: string
  ): Promise<boolean>;

  // A function to retrieve notes from chain that are spendable by a keypair
  abstract syncNotesForKeypair(target: string, owner: Keypair): Promise<Note[]>;

  // A function to prepare the parameters for a transaction
  abstract prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapToken: string
  ): Promise<Awaited<Parameters<VAnchorActions['transact']>>> | never;

  // A function for transcting
  abstract transact(
    tx: Transaction<NewNotesTxResult>,
    contractAddress: string,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: BigNumberish,
    refund: BigNumberish,
    recipient: string,
    relayer: string,
    wrapUnwrapToken: string,
    leavesMap: Record<string, Uint8Array[]>
  ): Promise<ContractReceipt>;
}

export type WithdrawTransactionPayloadType = {
  notes: Note[];
  changeUtxo: Utxo;
  recipient: string;
};

export type TransferTransactionPayloadType = {
  notes: Note[];
  changeUtxo: Utxo;
  transferUtxo: Utxo;
};

// Union type of all the payloads that can be used in a transaction (Deposit, Transfer, Withdraw)
export type TransactionPayloadType =
  | Note
  | WithdrawTransactionPayloadType
  | TransferTransactionPayloadType;

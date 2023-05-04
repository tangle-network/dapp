// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { EventBus, LoggerService } from '@webb-tools/app-util';
import { Keypair, Note, Utxo } from '@webb-tools/sdk-core';
import BN from 'bn.js';
import { BigNumber, ContractReceipt, Overrides } from 'ethers';

import { CancellationToken } from '../cancelation-token';
import { ActiveWebbRelayer } from '../relayer';
import {
  ActionEvent,
  NewNotesTxResult,
  Transaction,
  TransactionState,
} from '../transaction';
import type { WebbApiProvider } from '../webb-provider.interface';

export type ParametersOfTransactMethod = Awaited<
  Parameters<VAnchorActions['transact']>
>;

export type WithdrawTransactionPayloadType = {
  notes: Note[];
  changeUtxo: Utxo;
  recipient: string;
  refundAmount: bigint;
  feeAmount: bigint;
};

export type TransferTransactionPayloadType = {
  notes: Note[];
  changeUtxo: Utxo;
  transferUtxo: Utxo;
  feeAmount: BigNumber;
};

// Union type of all the payloads that can be used in a transaction (Deposit, Transfer, Withdraw)
export type TransactionPayloadType =
  | Note
  | WithdrawTransactionPayloadType
  | TransferTransactionPayloadType;

export const isVAnchorDepositPayload = (
  payload: TransactionPayloadType
): payload is Note => {
  return payload instanceof Note;
};

export const isVAnchorWithdrawPayload = (
  payload: TransactionPayloadType
): payload is WithdrawTransactionPayloadType => {
  if (!('changeUtxo' in payload)) {
    return false;
  }

  const changeUtxo: Utxo | undefined = payload['changeUtxo'];
  if (!changeUtxo || !(changeUtxo instanceof Utxo)) {
    return false;
  }

  const notes: Note[] | undefined = payload['notes'];
  if (!notes) {
    return false;
  }

  const isNotesValid = notes.every((note) => note instanceof Note);
  if (!isNotesValid) {
    return false;
  }

  return (
    'recipient' in payload &&
    typeof payload['recipient'] === 'string' &&
    payload['recipient'].length > 0 &&
    'feeAmount' in payload &&
    typeof payload['feeAmount'] === 'bigint' &&
    'refundAmount' in payload &&
    typeof payload['refundAmount'] === 'bigint'
  );
};

export const isVAnchorTransferPayload = (
  payload: TransactionPayloadType
): payload is TransferTransactionPayloadType => {
  if (!('notes' in payload)) {
    return false;
  }

  const notes: Note[] | undefined = payload['notes'];
  if (!notes) {
    return false;
  }

  const isNotesValid = notes.every((note) => note instanceof Note);
  if (!isNotesValid) {
    return false;
  }

  return (
    'changeUtxo' in payload &&
    payload['changeUtxo'] instanceof Utxo &&
    'transferUtxo' in payload &&
    payload['transferUtxo'] instanceof Utxo
  );
};

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

  /**
   * Get the next index on the merkle tree of bridge
   * where typedChainId is the chain id of the chain that the bridge is deployed on
   * and fungibleCurrencyId is the currency id of the currency that the bridge is deployed on
   * @param typedChainId The typed chain id.
   * @param fungibleCurrencyId The fungible currency id.
   */
  abstract getNextIndex(
    typedChainId: number,
    fungibleCurrencyId: number
  ): Promise<bigint>;

  /**
   * A function to get the leaf index of a leaf in the tree
   */
  abstract getLeafIndex(
    contractReceiptOrLeaf: ContractReceipt | Uint8Array,
    noteOrIndexBeforeInsertion: Note | number,
    vAnchorAddressOrTreeId: string
  ): Promise<bigint>;

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
  ): Promise<ParametersOfTransactMethod> | never;

  /**
   * A function to send a transaction to the relayer
   * @param activeRelayer The active relayer.
   * @param txArgs The transaction payload.
   * @param changeNotes The change notes.
   */
  abstract transactWithRelayer(
    activeRelayer: ActiveWebbRelayer,
    txArgs: ParametersOfTransactMethod,
    changeNotes: Note[]
  ): Promise<void>;

  /**
   * The transact function
   * @return {string} The transaction hash
   */
  abstract transact(
    tx: Transaction<NewNotesTxResult>,
    contractAddress: string,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: BigNumber | BN,
    refund: BigNumber | BN,
    recipient: string,
    relayer: string,
    wrapUnwrapToken: string,
    leavesMap: Record<string, Uint8Array[]>,
    overridesTransaction?: Overrides
  ): Promise<{ transactionHash: string; receipt?: TransactionReceipt }>;
}

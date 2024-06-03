// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';
import LoggerService from '@webb-tools/browser-utils/logger/LoggerService';
import {
  ChainType,
  Keypair,
  Note,
  ResourceId,
  Utxo,
} from '@webb-tools/sdk-core';
import { Address, Hash } from 'viem';
import { CancellationToken } from '../cancelation-token';
import { ActiveWebbRelayer } from '../relayer';
import {
  ActionEvent,
  NewNotesTxResult,
  TransactionExecutor,
  TransactionState,
} from '../transaction/transactionExecutor';
import { WebbProviderType } from '../types';
import type { WebbApiProvider } from '../webb-provider.interface';
import { NeighborEdge } from './types';

export type ParametersOfTransactMethod<ProviderType extends WebbProviderType> =
  Awaited<Parameters<VAnchorActions<ProviderType>['transact']>>;

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
  feeAmount: bigint;
  refundAmount: bigint;
  refundRecipient: string;
};

// Union type of all the payloads that can be used in a transaction (Deposit, Transfer, Withdraw)
export type TransactionPayloadType =
  | Note
  | WithdrawTransactionPayloadType
  | TransferTransactionPayloadType;

export const isVAnchorDepositPayload = (
  payload: TransactionPayloadType,
): payload is Note => {
  return payload instanceof Note;
};

export const isVAnchorWithdrawPayload = (
  payload: TransactionPayloadType,
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
  payload: TransactionPayloadType,
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
    payload['transferUtxo'] instanceof Utxo &&
    'feeAmount' in payload &&
    typeof payload['feeAmount'] === 'bigint' &&
    ('refundAmount' in payload
      ? typeof payload['refundAmount'] === 'bigint'
      : true) &&
    ('refundRecipient' in payload
      ? typeof payload['refundRecipient'] === 'string'
      : true)
  );
};

export abstract class AbstractState<
  T extends WebbApiProvider<unknown>,
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
  ProviderType extends WebbProviderType,
  T extends WebbApiProvider<unknown> = WebbApiProvider<unknown>,
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
    fungibleCurrencyId: number,
  ): Promise<bigint>;

  /**
   * A function to get the leaf index of a leaf in the tree
   */
  abstract getLeafIndex(
    txHashOrLeaf: Hash,
    noteOrIndexBeforeInsertion: Note,
    indexBeforeInsertion: number,
    vAnchorAddressOrTreeId: string,
  ): Promise<bigint>;

  abstract getResourceId(
    anchorAddressOrTreeId: string,
    chainId: number,
    chainType: ChainType,
  ): Promise<ResourceId>;

  // A function to check if the (account, public key) pair is registered.
  abstract isPairRegistered(
    target: string,
    account: string,
    pubkey: string,
  ): Promise<boolean>;

  // A function to register an account. It will return true if the account was registered, and false otherwise.
  abstract register(
    target: string,
    account: string,
    pubkey: string,
  ): Promise<boolean>;

  // A function to retrieve notes from chain that are spendable by a keypair
  abstract syncNotesForKeypair(
    target: string,
    owner: Keypair,
    startingBlock?: bigint,
    abortSignal?: AbortSignal,
  ): Promise<Note[]>;

  // A function to prepare the parameters for a transaction
  abstract prepareTransaction(
    tx: TransactionExecutor<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapToken: string,
  ): Promise<ParametersOfTransactMethod<ProviderType>> | never;

  /**
   * A function to send a transaction to the relayer
   * @param activeRelayer The active relayer.
   * @param txArgs The transaction payload.
   * @param changeNotes The change notes.
   */
  abstract transactWithRelayer(
    activeRelayer: ActiveWebbRelayer,
    txArgs: ParametersOfTransactMethod<ProviderType>,
    changeNotes: Note[],
  ): Promise<Hash>;

  /**
   * The transact function
   * @return {string} The transaction hash
   */
  abstract transact(
    tx: TransactionExecutor<NewNotesTxResult>,
    contractAddress: ProviderType extends 'web3' ? Address : string,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: bigint,
    refund: bigint,
    recipient: ProviderType extends 'web3' ? Address : string,
    relayer: ProviderType extends 'web3' ? Address : string,
    wrapUnwrapToken: string,
    leavesMap: Record<string, Uint8Array[]>,
  ): Promise<Hash>;

  abstract waitForFinalization(hash: Hash): Promise<void>;

  abstract getLatestNeighborEdges(
    fungibleId: number,
    typedChainId?: number,
  ): Promise<ReadonlyArray<NeighborEdge>>;

  /**
   * Validate whether all the input notes are valid
   * to be spent in the corresponding typed chain id
   * @param notes the input notes to validate
   * @param typedChainId the typed chain id where the notes are going to be used
   * @param fungibleId the fungible id to get the anchor identifier
   */
  abstract validateInputNotes(
    notes: ReadonlyArray<Note>,
    typedChainId: number,
    fungibleId: number,
  ): Promise<boolean>;
}

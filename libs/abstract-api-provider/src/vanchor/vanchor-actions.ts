// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { WebbApiProvider } from '../webb-provider.interface';

import { Keypair, Note, Utxo } from '@webb-tools/sdk-core';
import { AbstractState } from '.';
import { NewNotesTxResult, Transaction } from '../transaction';
import { BigNumberish } from 'ethers';
import { ZkComponents } from '@webb-tools/utils';

export abstract class VAnchorActions<T extends WebbApiProvider<any>> extends AbstractState<T> {
  abstract fetchSmallFixtures(tx: Transaction<NewNotesTxResult>, maxEdges: number): Promise<ZkComponents>;
  abstract fetchLargeFixtures(tx: Transaction<NewNotesTxResult>, maxEdges: number): Promise<ZkComponents>;
  // A function to check if the (account, public key) pair is registered.
  abstract isPairRegistered(target: string, account: string, pubkey: string): Promise<boolean>;
  // A function to register an account. It will return true if the account was registered, and false otherwise.
  abstract register(target: string, account: string, pubkey: string): Promise<boolean>;
  // A function to retrieve notes from chain that are spendable by a keypair
  abstract syncNotesForKeypair(target: string, owner: Keypair): Promise<Note[]>;
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
  ): Promise<Transaction<NewNotesTxResult>>;
}

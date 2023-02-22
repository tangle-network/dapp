import {
  ActiveWebbRelayer,
  NewNotesTxResult,
  Transaction,
} from '@webb-tools/abstract-api-provider';
import {
  ParametersOfTransactMethod,
  VAnchorActions,
} from '@webb-tools/abstract-api-provider/vanchor/vanchor-actions';
import { Keypair, Note, Utxo } from '@webb-tools/sdk-core';
import { BigNumberish, ContractReceipt } from 'ethers';

import { WebbPolkadot } from '../webb-provider';

export class PolkadotVAnchorActions extends VAnchorActions<WebbPolkadot> {
  prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    wrapUnwrapToken: string
  ): Promise<ParametersOfTransactMethod> | never {
    throw new Error('Method not implemented.');
  }

  transactWithRelayer(
    activeRelayer: ActiveWebbRelayer,
    txArgs: ParametersOfTransactMethod,
    changeNotes: Note[]
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  transact(
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
  ): Promise<ContractReceipt> {
    throw new Error('Method not implemented.');
  }

  async isPairRegistered(
    treeId: string,
    account: string,
    pubkey: string
  ): Promise<boolean> {
    return true;
  }

  async register(
    treeId: string,
    account: string,
    pubkey: string
  ): Promise<boolean> {
    throw new Error('Attempted to register with Polkadot');
  }

  async syncNotesForKeypair(
    anchorAddress: string,
    owner: Keypair
  ): Promise<Note[]> {
    throw new Error('Attempted to sync notes for keypair with Polkadot');
  }
}

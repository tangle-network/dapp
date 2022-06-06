// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import type { WebbWeb3Provider } from './webb-provider';

import { Note } from '@webb-tools/sdk-core';
import { JsNote as DepositNote } from '@webb-tools/wasm-utils';

import { AnchorApi, VAnchorWithdraw, WithdrawState } from '../abstracts';
import { ChainType, computeChainIdType, evmIdIntoInternalChainId } from '../chains';
import { utxoFromVAnchorNote } from '../contracts/utils/make-deposit';
import { BridgeConfig } from '../types';
import {
  BridgeStorage,
  bridgeStorageFactory,
  getAnchorDeploymentBlockNumber,
  getEVMChainNameFromInternal,
} from '../utils';

export class Web3VAnchorWithdraw extends VAnchorWithdraw<WebbWeb3Provider> {
  protected get bridgeApi() {
    return this.inner.methods.anchorApi as AnchorApi<WebbWeb3Provider, BridgeConfig>;
  }

  protected get config() {
    return this.inner.config;
  }

  // Same chain ('mixer') withdraw flow.
  // 1. Fetch all of the leaves (stored and new from relayer / inner provider querying)
  // 2. Connect and update a new protocol-solidity Anchor instance with all of the leaves.
  //
  // If relayer is selected:
  //    Use Anchor instance methods to generate proof and initiate relayed withdraw flow.
  // If no relayer is selected:
  //    Use Anchor instance 'withdraw' method.
  async sameChainWithdraw(note: DepositNote, recipient: string): Promise<string> {
    this.cancelToken.cancelled = false;

    const activeBridge = this.bridgeApi.activeBridge;

    if (!activeBridge) {
      throw new Error('No activeBridge set on the web3 anchor api');
    }

    // Parse the intended target address for the note
    const activeChain = await this.inner.getChainId();
    const internalId = evmIdIntoInternalChainId(activeChain);

    const anchorConfigsForBridge = activeBridge.anchors.find((anchor) => anchor.type === 'variable')!;
    const contractAddress = anchorConfigsForBridge.anchorAddresses[internalId]!;

    // create the Anchor instance
    const contract = await this.inner.getVariableAnchorByAddress(contractAddress);

    // initialize the VAnchor Wrapper from protocol solidity.
    await contract.initializeWrapper();

    // If something went wrong initializing the wrapper, throw an error
    if (!contract.wrapper) {
      throw new Error('Issue initializing wrapper');
    }

    // Fetch the leaves that we already have in storage
    const bridgeStorageStorage = await bridgeStorageFactory(Number(note.sourceChainId));
    const storedContractInfo: BridgeStorage[0] = (await bridgeStorageStorage.get(contractAddress.toLowerCase())) || {
      lastQueriedBlock:
        getAnchorDeploymentBlockNumber(computeChainIdType(ChainType.EVM, activeChain), contractAddress) || 0,
      leaves: [] as string[],
    };

    let allLeaves: string[] = [];

    // Fetch the new leaves - from a relayer or from the chain directly.
    // TODO: Fetch the leaves from the relayer
    // eslint-disable-next-line no-constant-condition
    if (/* this.activeRelayer */ false) {
      // fetch the new leaves (all leaves) from the relayer
    } else {
      // fetch the new leaves from on-chain
      const depositLeaves = await contract.getDepositLeaves(
        storedContractInfo.lastQueriedBlock,
        await this.inner.getBlockNumber()
      );

      allLeaves = [...storedContractInfo.leaves, ...depositLeaves.newLeaves];
    }

    console.log('first entry in all leaves: ', allLeaves[0]);

    // Fetch the information for public inputs into the proof
    const accounts = await this.inner.accounts.accounts();
    const account = accounts[0];

    // Fetch the information for private inputs into the proof
    const depositUtxo = await utxoFromVAnchorNote(note);
    const depositCommitment = depositUtxo.getCommitment();
    const leafIndex = allLeaves.findIndex((commitment) => commitment === depositCommitment.toHexString());

    console.log('leafIndex: ', leafIndex);

    depositUtxo.index = leafIndex;

    // Give the anchor wrapper the fetched leaves
    const successfulSet = await contract.wrapper.setWithLeaves(allLeaves);

    console.log('After attempting to set the leaves on achor wrapper: ', successfulSet);

    const section = `Bridge ${Object.keys(anchorConfigsForBridge.anchorAddresses)
      .map((id) => getEVMChainNameFromInternal(this.config, Number(id)))
      .join('-')}`;
    const key = 'web3-vbridge-withdraw';

    // Check for cancelled here, abort if it was set.
    if (this.cancelToken.cancelled) {
      this.inner.notificationHandler({
        description: 'Withdraw canceled',
        key,
        level: 'error',
        message: `${section}:withdraw`,
        name: 'Transaction',
      });
      this.emit('stateChange', WithdrawState.Ideal);

      return '';
    }

    this.emit('stateChange', WithdrawState.GeneratingZk);

    let txHash = '';

    this.emit('stateChange', WithdrawState.SendingTransaction);

    this.inner.notificationHandler({
      description: 'Withdraw in progress',
      key,
      level: 'loading',
      message: `${section}:withdraw`,
      name: 'Transaction',
    });

    try {
      const receipt = await contract.wrapper.transact([depositUtxo], [], 0, account.address, account.address);

      txHash = receipt.transactionHash;
    } catch (e) {
      this.emit('stateChange', WithdrawState.Ideal);

      this.inner.notificationHandler({
        description: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
        key,
        level: 'error',
        message: `${section}:withdraw`,
        name: 'Transaction',
      });

      return txHash;
    }

    this.emit('stateChange', WithdrawState.Ideal);
    this.inner.notificationHandler({
      description: recipient,
      key,
      level: 'success',
      message: `${section}:withdraw`,
      name: 'Transaction',
    });

    return txHash;
  }

  async crossChainWithdraw(note: DepositNote, recipient: string): Promise<string> {
    console.log('attempted cross chain withdraw flow with: ', note, recipient);

    return Promise.reject('cross Chain Withdraw Unimplemented');
  }

  // withdraw determines if the withdraw flow should be cross-chain or the same chain.
  // The merkle proof is always generated from the source anchor, therefore, a new provider
  // needs to be constructed in the cross-chain scenario.
  // Zero knowledge files are fetched in both withdraw flows.
  async withdraw(notes: string[], recipient: string, amount: string): Promise<string> {
    // TODO: Parse all input notes and pass to withdraw flows
    const parseNote = await Note.deserialize(notes[0]);

    console.log('attempt to withdraw: ', amount);

    const depositNote = parseNote.note;

    if (depositNote.sourceChainId === depositNote.targetChainId) {
      return this.sameChainWithdraw(depositNote, recipient);
    } else {
      return this.crossChainWithdraw(depositNote, recipient);
    }
  }
}

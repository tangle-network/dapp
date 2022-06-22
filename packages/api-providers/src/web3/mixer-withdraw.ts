// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { LoggerService } from '@webb-tools/app-util';
import {
  AnchorPMSetupInput,
  CircomProvingManager,
  getFixedAnchorExtDataHash,
  Note,
  toFixedHex,
} from '@webb-tools/sdk-core';

import { hexToU8a } from '@polkadot/util';

import { TransactionState } from '../abstracts';
import { evmIdIntoInternalChainId } from '../chains';
import { depositFromAnchorNote } from '../contracts/wrappers';
import { fetchFixedAnchorKeyForEdges, fetchFixedAnchorWasmForEdges } from '../ipfs/evm';
import { BridgeStorage, bridgeStorageFactory, getAnchorDeploymentBlockNumber } from '../utils/storage';
import { Web3AnchorWithdraw } from './anchor-withdraw';

const logger = LoggerService.get('Web3MixerWithdraw');

// The Web3Mixer Withdraw uses anchor withdraw, with the same target and source chain id.
export class Web3MixerWithdraw extends Web3AnchorWithdraw {
  // Withdraw is overriden to emit notifications specific to 'mixer'
  async withdraw(note: string, recipient: string): Promise<string> {
    logger.trace(`Withdraw using note ${note} , recipient ${recipient}`);

    const parseNote = await Note.deserialize(note);
    const depositNote = parseNote.note;

    this.cancelToken.cancelled = false;

    const activeBridge = this.bridgeApi.activeBridge;

    if (!activeBridge) {
      throw new Error('No activeBridge set on the web3 anchor api');
    }

    // Parse the intended target address for the note
    const activeChain = await this.inner.getChainId();
    const internalId = evmIdIntoInternalChainId(activeChain);
    const contractAddresses = activeBridge.anchors.find(
      (anchor) => anchor.type === 'fixed' && anchor.amount === depositNote.amount
    )!;
    const contractAddress = contractAddresses.anchorAddresses[internalId]!;

    // create the Anchor instance
    const contract = this.inner.getFixedAnchorByAddress(contractAddress);
    const section = `Mixer ${activeBridge.asset}`;
    const key = 'web3-mixer-withdraw';

    this.inner.notificationHandler({
      description: 'Withdraw in progress',
      key,
      level: 'loading',
      message: `${section} withdraw`,
      name: 'Transaction',
    });

    // Fetch the zero knowledge files required for creating witnesses and verifying.
    this.emit('stateChange', TransactionState.FetchingFixtures);
    const maxEdges = await contract.inner.maxEdges();
    const wasmBuf = await fetchFixedAnchorWasmForEdges(maxEdges);
    const circuitKey = await fetchFixedAnchorKeyForEdges(maxEdges);

    // Fetch the leaves that we already have in storage
    this.emit('stateChange', TransactionState.FetchingLeaves);
    const bridgeStorageStorage = await bridgeStorageFactory(Number(depositNote.sourceChainId));
    const storedContractInfo: BridgeStorage[0] = (await bridgeStorageStorage.get(contractAddress.toLowerCase())) || {
      lastQueriedBlock:
        getAnchorDeploymentBlockNumber(Number(depositNote.sourceChainId), contractAddress.toLowerCase()) || 0,
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

    // Fetch the information for private inputs into the proof
    const deposit = depositFromAnchorNote(depositNote);
    const leafIndex = allLeaves.findIndex((commitment) => commitment === deposit.commitment);

    const provingInput: AnchorPMSetupInput = {
      fee: 0,
      leafIndex,
      leaves: allLeaves.map((leaf) => hexToU8a(leaf)),
      note,
      provingKey: circuitKey,
      relayer: recipient,
      recipient,
      refreshCommitment: '0',
      refund: 0,
      roots: [],
    };

    const treeDepth = await contract.inner.levels();

    this.emit('stateChange', TransactionState.GeneratingZk);
    const pm = new CircomProvingManager(Buffer.from(wasmBuf), treeDepth, null);
    const proof = await pm.prove('anchor', provingInput);
    const extDataHash = getFixedAnchorExtDataHash(0, recipient, 0, 0, recipient).toString();

    // Check for cancelled here, abort if it was set.
    if (this.cancelToken.cancelled) {
      this.inner.notificationHandler({
        description: 'Withdraw canceled',
        key,
        level: 'error',
        message: `${section} withdraw`,
        name: 'Transaction',
      });
      this.emit('stateChange', TransactionState.Ideal);

      return '';
    }

    let txHash = '';

    this.emit('stateChange', TransactionState.SendingTransaction);

    try {
      const tx = await contract.inner.withdraw(
        {
          proof: proof.proof,
          _nullifierHash: proof.nullifierHash,
          _roots: `0x${proof.roots.map((root) => root.slice(2)).join('')}`,
          _extDataHash: extDataHash,
        },
        {
          _fee: 0,
          _recipient: recipient,
          _refreshCommitment: toFixedHex(0),
          _refund: BigInt(0),
          _relayer: recipient,
        },
        {
          gasLimit: '0x5B8D80',
        }
      );
      const receipt = await tx.wait();

      txHash = receipt.transactionHash;
    } catch (e) {
      this.emit('stateChange', TransactionState.Ideal);

      this.inner.notificationHandler({
        description: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
        key,
        level: 'error',
        message: `${section} withdraw`,
        name: 'Transaction',
      });

      return txHash;
    }

    this.emit('stateChange', TransactionState.Ideal);
    this.inner.notificationHandler({
      description: recipient,
      key,
      level: 'success',
      message: `${section} withdraw`,
      name: 'Transaction',
    });

    return '';
  }
}

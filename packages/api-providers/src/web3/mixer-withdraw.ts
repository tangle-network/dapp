// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Anchor } from '@webb-tools/anchors';
import { LoggerService } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-core';

import { WithdrawState } from '../abstracts';
import { evmIdIntoInternalChainId } from '../chains';
import { fetchFixedAnchorKeyForEdges, fetchFixedAnchorWasmForEdges } from '../ipfs/evm';
import { getAnchorDeploymentBlockNumber } from '../utils/storage-mock';
import { BridgeStorage, bridgeStorageFactory, buildFixedWitness, depositFromAnchorNote } from '../';
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

    // Fetch the leaves that we already have in storage
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

    // Fetch the information for public inputs into the proof
    const accounts = await this.inner.accounts.accounts();
    const account = accounts[0];

    // Fetch the information for private inputs into the proof
    const deposit = depositFromAnchorNote(depositNote);
    const leafIndex = allLeaves.findIndex((commitment) => commitment === deposit.commitment);

    // Fetch the zero knowledge files required for creating witnesses and verifying.
    const maxEdges = await contract.inner.maxEdges();
    const wasmBuf = await fetchFixedAnchorWasmForEdges(maxEdges);
    const witnessCalculator = await buildFixedWitness(wasmBuf, {});
    const circuitKey = await fetchFixedAnchorKeyForEdges(maxEdges);

    // This anchor wrapper from protocol-solidity is used for public inputs generation
    const anchorWrapper = await Anchor.connect(
      contractAddress,
      {
        wasm: Buffer.from(wasmBuf),
        witnessCalculator,
        zkey: circuitKey,
      },
      this.inner.getEthersProvider().getSigner()
    );

    this.emit('stateChange', WithdrawState.GeneratingZk);
    const withdrawSetup = await anchorWrapper.setupWithdraw(
      deposit,
      leafIndex,
      account.address,
      account.address,
      BigInt(0),
      0
    );

    // Check for cancelled here, abort if it was set.
    if (this.cancelToken.cancelled) {
      this.inner.notificationHandler({
        description: 'Withdraw canceled',
        key,
        level: 'error',
        message: `${section} withdraw`,
        name: 'Transaction',
      });
      this.emit('stateChange', WithdrawState.Ideal);

      return '';
    }

    let txHash = '';

    this.emit('stateChange', WithdrawState.SendingTransaction);

    try {
      const tx = await contract.inner.withdraw(withdrawSetup.publicInputs, withdrawSetup.extData, {
        gasLimit: '0x5B8D80',
      });
      const receipt = await tx.wait();

      txHash = receipt.transactionHash;
    } catch (e) {
      this.emit('stateChange', WithdrawState.Ideal);

      this.inner.notificationHandler({
        description: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
        key,
        level: 'error',
        message: `${section} withdraw`,
        name: 'Transaction',
      });

      return txHash;
    }

    this.emit('stateChange', WithdrawState.Ideal);
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

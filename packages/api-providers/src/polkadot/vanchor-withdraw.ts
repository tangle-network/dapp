// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import '@webb-tools/types/cjs/index.js';
import '@webb-tools/api-derive/cjs/index.js';

import type { WebbPolkadot } from './webb-provider';

import {
  currencyToUnitI128,
  getCachedFixtureURI,
  WebbError,
  WebbErrorCodes,
  WithdrawState,
  withLocalFixtures,
} from '@webb-dapp/api-providers';
import { LoggerService } from '@webb-tools/app-util';
import { ArkworksProvingManager, Note, ProvingManagerSetupInput, Utxo } from '@webb-tools/sdk-core';
import { BigNumber } from 'ethers';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';

import { VAnchorWithdraw } from '../abstracts/anchor/vanchor-withdraw';

const logger = LoggerService.get('SubstrateVAnchorWithdraw');
async function fetchSubstrateVAnchorProvingKey() {
  const IPFSUrl = 'https://ipfs.io/ipfs/QmZiNuAKp2QGp281bqasNqvqccPCGp4yoxWbK8feecefML';
  const cachedURI = getCachedFixtureURI('proving_key_uncompressed_sub_vanchor_2_2_2.bin');
  const ipfsKeyRequest = await fetch(withLocalFixtures() ? cachedURI : IPFSUrl);
  const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();

  logger.info('Done Fetching key');
  const circuitKey = new Uint8Array(circuitKeyArrayBuffer);

  return circuitKey;
}

export class PolkadotVAnchorWithdraw extends VAnchorWithdraw<WebbPolkadot> {
  async withdraw(_notes: string[], recipient: string, amountUnit: string): Promise<string> {
    const secret = randomAsU8a();
    const account = await this.inner.accounts.activeOrDefault;
    const notes = [
      'webb://v2:vanchor/2199023256632:2199023256632/9:9/3804000000020000000000000000000000000000000000000000000000000000:0080c6a47e8d0300000000000000000000000000000000000000000000000000:985efa5808b6c01fd7035fd0440256a6570bc75a38a9267dc6d3e96d63e9031d:63e54b34a3518d780d5f8a4b8c73a15fb0d3ad40ac2ef8deec110c4247b0292f/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Arkworks&token=TEST&denom=18&amount=1000000000000000&index=3',
      'webb://v2:vanchor/2199023256632:2199023256632/9:9/3804000000020000000000000000000000000000000000000000000000000000:0080c6a47e8d0300000000000000000000000000000000000000000000000000:a492d97a80585fd34831027835e653483763ace17468413404c3e81892a1930b:874444f2c5516175d57d0aa53839f765117a63b2d7600ab9c69ccdedd9f72a2b/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Arkworks&token=TEST&denom=18&amount=1000000000000000&index=5',
    ];
    this.emit('stateChange', WithdrawState.GeneratingZk);

    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const accountId = account.address;
    const relayerAccountId = account.address;
    const recipientAccountDecoded = decodeAddress(accountId);
    const relayerAccountDecoded = decodeAddress(relayerAccountId);

    const inputNotes = await Promise.all(notes.map((note) => Note.deserialize(note)));
    const inputAmounts: number = inputNotes.reduce((acc: number, { note }) => acc + Number(note.amount), 0);
    // const amount = currencyToUnitI128(Number(amountUnit)).toString();
    const amount = String(inputAmounts);

    const reminder = inputAmounts - Number(amount);
    console.log(`
    input amount ${inputAmounts}
    amount to withdraw ${amount}
   reminder ${reminder}
    `);
    if (reminder < 0) {
      throw new Error(`Input ${inputAmounts} is less than the withdrawn amount ${amount}`);
    }
    const targetChainId = inputNotes[0].note.targetChainId;
    const treeId = inputNotes[0].note.sourceIdentifyingData;
    const output1 = await Utxo.generateUtxo({
      amount: String(reminder),
      chainId: targetChainId,
      backend: 'Arkworks',
      curve: 'Bn254',
    });
    const output2 = await Utxo.generateUtxo({
      amount: String(0),
      chainId: targetChainId,
      backend: 'Arkworks',
      curve: 'Bn254',
    });
    let publicAmount = -amount;

    const latestIndex = inputNotes.reduce((index, { note }) => {
      if (index < Number(note.index)) {
        return Number(note.index);
      }
      return index;
    }, 0);
    console.log(`last leaf index ${latestIndex}`);
    const leaves = await this.inner.api.derive.merkleTreeBn254.getLeavesForTree(treeId, 0, latestIndex);
    const leavesMap: any = {};
    /// Assume same chain withdraw-deposit
    leavesMap[targetChainId] = leaves;
    console.log(leaves.map((l) => u8aToHex(l)));
    const tree = await this.inner.api.query.merkleTreeBn254.trees(treeId);
    const root = tree.unwrap().root.toHex();
    const neighborRoots: string[] = await (this.inner.api.rpc as any).lt
      .getNeighborRoots(treeId)
      .then((roots: any) => roots.toHuman());
    const rootsSet = [hexToU8a(root), hexToU8a(neighborRoots[0])];
    const outputNote = await Note.deserialize(inputNotes[0].serialize());
    const outputCommitment = output1.commitment;
    const { encrypted: comEnc1 } = naclEncrypt(output1.commitment, secret);
    const { encrypted: comEnc2 } = naclEncrypt(output2.commitment, secret);

    const provingKey = await fetchSubstrateVAnchorProvingKey();
    const extData = {
      relayer: accountId,
      recipient: relayerAccountId,
      fee: 0,
      extAmount: BigNumber.from(publicAmount),
      encryptedOutput1: u8aToHex(comEnc1),
      encryptedOutput2: u8aToHex(comEnc2),
    };

    const worker = this.inner.wasmFactory('wasm-utils');
    const pm = new ArkworksProvingManager(worker);

    const vnachorWithdrawSetup: ProvingManagerSetupInput<'vanchor'> = {
      encryptedCommitments: [comEnc1, comEnc2],
      extAmount: String(publicAmount),
      fee: '0',
      leavesMap,
      provingKey,
      recipient: recipientAccountDecoded,
      relayer: relayerAccountDecoded,
      roots: rootsSet,
      chainId: inputNotes[0].note.targetChainId,
      indices: inputNotes.map(({ note }) => Number(note.index)),
      inputNotes: inputNotes,
      publicAmount: String(publicAmount),
      output: [output1, output2],
    };
    console.log(vnachorWithdrawSetup);
    const data = await pm.prove('vanchor', vnachorWithdrawSetup);
    const vanchorProofData = {
      proof: `0x${data.proof}`,
      publicAmount: data.publicAmount,
      roots: rootsSet,
      inputNullifiers: data.inputUtxos.map((utxo) => {
        return `0x${utxo.nullifier}`;
      }),
      outputCommitments: data.outputNotes.map((note) => u8aToHex(note.getLeaf())),
      extDataHash: data.extDataHash,
    };
    this.emit('stateChange', WithdrawState.SendingTransaction);
    const leafsCount = await this.inner.api.derive.merkleTreeBn254.getLeafCountForTree(Number(treeId));
    const indexBeforeInsertion = Math.max(leafsCount - 1, 0);
    console.log({
      leafsCount,
      indexBeforeInsertion,
    });
    const tx = this.inner.txBuilder.build(
      {
        method: 'transact',
        section: 'vAnchorBn254',
      },
      [treeId, vanchorProofData, extData]
    );
    console.log([treeId, vanchorProofData, extData]);

    const txHash = await tx.call(account.address);
    const leafIndex = await this.getleafIndex(outputCommitment, indexBeforeInsertion, treeId);

    console.log(txHash, leafIndex);
    // to update utxo for the output note
  }

  private async getleafIndex(leaf: Uint8Array, indexBeforeInsertion: number, treeId: number): Promise<number> {
    const api = this.inner.api;
    /**
     * Ex tree has 500 leaves
     * Before insertion index is 499
     * Given that many insertions happened while processing a tx
     * The tree now has 510 leaves
     * Fetch a slice of the leaves starting from the index before insertion [index499,...index509]
     * The leaf index will be index499 +  the index of the slice
     * */
    const leafCount = await api.derive.merkleTreeBn254.getLeafCountForTree(Number(treeId));
    const leaves = await api.derive.merkleTreeBn254.getLeavesForTree(
      Number(treeId),
      indexBeforeInsertion,
      leafCount - 1
    );
    const leafHex = u8aToHex(leaf);
    const shiftedIndex = leaves.findIndex((leaf) => u8aToHex(leaf) === leafHex);

    if (shiftedIndex === -1) {
      throw new Error(`Leaf isn't in the tree`);
    }
    return Math.max(indexBeforeInsertion + shiftedIndex - 1, 0);
  }
}

// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import '@webb-tools/types/cjs/index.js';

import type { WebbPolkadot } from './webb-provider';

import { VAnchorWithdraw } from '../abstracts/anchor/vanchor-withdraw';

async function fetchSubstrateAnchorProvingKey() {
  return new Uint8Array([]);
}
export class PolkadotVAnchorWithdraw extends VAnchorWithdraw<WebbPolkadot> {
  async withdraw(notes: string[], recipient: string, amount: string): Promise<string> {
    /*    const inputNotes = await Promise.all(notes.map((note) => Note.deserialize(note)));
    const inputAmounts = inputNotes.reduce((acc, { note }) => acc + Number(note.amount), 0);
    const reminder = inputAmounts - Number(amount);
    if (reminder < 0) {
      throw new Error(`Input ${inputAmounts} is less than the withdrawn amount ${amount}`);
    }
    const targetChainId = inputNotes[0].note.targetChainId;
    const treeId = inputNotes[0].note.sourceIdentifyingData;
    const output1 = await createBn254CT2(2, String(reminder), targetChainId, undefined);
    const output2 = await createBn254CT2(2, '0', targetChainId, undefined);
    let publicAmount = -amount;
    const leavesMap: any = {};
    leavesMap[targetChainId] = [];
    const tree = await this.inner.api.query.merkleTreeBn254.trees(treeId);
    const root = tree.unwrap().root.toHex();
    const provingKey = await fetchSubstrateAnchorProvingKey();*/
    await fetchSubstrateAnchorProvingKey();
    throw new Error('not implemented');
  }
}

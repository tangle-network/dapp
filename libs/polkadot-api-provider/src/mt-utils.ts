import '@webb-tools/protocol-substrate-types';

import { Note } from '@webb-tools/sdk-core';

import { ApiPromise } from '@polkadot/api';
import { hexToU8a, u8aToHex } from '@polkadot/util';

export async function getLeafIndex(api: ApiPromise, leaf: Uint8Array, indexBeforeInsertion: number, treeId: number) {
  /**
   * Ex tree has 500 leaves
   * Before insertion index is 499
   * Given that many insertions happened while processing a tx
   * The tree now has 510 leaves
   * Fetch a slice of the leaves starting from the index before insertion [index499,...index509]
   * The leaf index will be index499 +  the index of the slice
   * */
  const leafCount: number = await api.derive.merkleTreeBn254.getLeafCountForTree(Number(treeId));
  const leaves: Uint8Array[] = await api.derive.merkleTreeBn254.getLeavesForTree(
    Number(treeId),
    indexBeforeInsertion,
    leafCount - 1
  );
  const leafHex = u8aToHex(leaf);
  const shiftedIndex = leaves.findIndex((leaf) => u8aToHex(leaf) === leafHex);

  if (shiftedIndex === -1) {
    throw new Error(`Leaf isn't in the tree`);
  }
  console.log({
    indexBeforeInsertion,
    shiftedIndex,
    leaves: leaves.map((l) => u8aToHex(l)),
  });
  return Math.max(indexBeforeInsertion + shiftedIndex, 0);
}

export function getLeafCount(api: ApiPromise, treeId: number): Promise<number> {
  return api.derive.merkleTreeBn254.getLeafCountForTree(Number(treeId));
}

export async function getLeaves(api: ApiPromise, treeId: number, start: number, end: number): Promise<Uint8Array[]> {
  return api.derive.merkleTreeBn254.getLeavesForTree(treeId, start, end);
}

export async function rootOfLeaves(leaves: Uint8Array[]) {
  const wasm = await import('@webb-tools/wasm-utils');
  const tree = new wasm.MTBn254X5(leaves, '0');
  return hexToU8a(`0x${tree.root}`);
}

export async function validateVAnchorNoteIndex(api: ApiPromise, treeId: number, noteStr: string) {
  const note = await Note.deserialize(noteStr);
  const noteIndex = Number(note.note.index);
  const leaf = note.getLeaf();
  const leafHex = u8aToHex(leaf);
  const leafCount: number = await api.derive.merkleTreeBn254.getLeafCountForTree(Number(treeId));
  const leaves: Uint8Array[] = await api.derive.merkleTreeBn254.getLeavesForTree(Number(treeId), 0, leafCount - 1);
  const onChainIndex = leaves.findIndex((leaf) => u8aToHex(leaf) === leafHex);
  return {
    noteIndex,
    onChainIndex,
    leafHex,
    isValid: noteIndex === onChainIndex,
  };
}

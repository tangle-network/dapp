// Worker to create a merkle tree

import { MerkleTree, toFixedHex } from '@webb-tools/sdk-core';
import { hexToU8a } from '@webb-tools/utils';

self.onmessage = async (e) => {
  const { levels, leaves, targetRoot, commitment } = e.data;

  const tree = new MerkleTree(levels, leaves, targetRoot);

  if (!tree) {
    self.postMessage({
      error: 'Fetched leaves do not match bridged anchor state',
    });
    return;
  }

  const provingLeaves = tree.elements().map((el) => el.toHexString());

  const leafIndex = tree.getIndexByElement(BigInt(commitment));

  self.postMessage({
    result: {
      provingLeaves,
      leafIndex,
    },
  });
};

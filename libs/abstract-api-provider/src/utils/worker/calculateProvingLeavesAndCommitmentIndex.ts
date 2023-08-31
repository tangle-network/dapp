// Worker to create a merkle tree

import { MerkleTree } from '@webb-tools/sdk-core';

self.onmessage = async (e) => {
  const { levels, leaves, targetRoot, commitment } = e.data;

  self.postMessage({
    log: `leaves: ${leaves.length}`,
  });
  self.postMessage({
    log: `targetRoot: ${targetRoot}`,
  });

  const mt = new MerkleTree(levels, leaves);
  self.postMessage({
    log: `mt root: ${mt.root().toHexString()}`,
  });

  const tree = MerkleTree.createTreeWithRoot(levels, leaves, targetRoot);

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

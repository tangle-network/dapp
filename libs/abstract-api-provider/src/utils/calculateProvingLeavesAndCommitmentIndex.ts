import { HexString } from '@polkadot/util/types';
import assert from 'assert';

/**
 * Constructs the merkle tree is a heavy operation,
 * so we use a web worker to do it to prevent blocking the UI
 * @param levels the number of levels in the tree
 * @param leaves the leaves to construct the tree with
 * @param targetRoot the target root to construct the tree with
 * @param commitment the commitment to find the index of
 * @param basePath the base path to the worker (e.g. import.meta.url)
 */
function calculateProvingLeavesAndCommitmentIndex(
  levels: number,
  leaves: string[],
  targetRoot: string,
  commitment: string
): Promise<{ provingLeaves: HexString[]; leafIndex: number }> {
  // Validate inputs
  leaves.forEach((leaf) => {
    assert.strictEqual(
      leaf.length,
      66,
      'Invalid leaf size, expected 32 bytes or 64 hex chars with 0x prefix'
    );
  });

  assert.strictEqual(
    targetRoot.length,
    66,
    'Invalid target root size, expected 32 bytes or 64 hex chars with 0x prefix'
  );

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL(
        './worker/calculateProvingLeavesAndCommitmentIndex.ts',
        import.meta.url
      ),
      { type: 'module' }
    );

    worker.onmessage = (e) => {
      const { data } = e;
      if (data.log) {
        return console.log(data.log);
      }

      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result);
      }
    };

    worker.onerror = (e) => {
      reject(e);
    };

    worker.postMessage({
      levels,
      leaves,
      targetRoot,
      commitment,
    });
  });
}

export default calculateProvingLeavesAndCommitmentIndex;

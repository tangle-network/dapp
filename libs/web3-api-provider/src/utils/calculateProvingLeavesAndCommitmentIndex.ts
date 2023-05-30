import { HexString } from '@polkadot/util/types';

/**
 * Constructs the merkle tree is a heavy operation,
 * so we use a web worker to do it to prevent blocking the UI
 */
export function calculateProvingLeavesAndCommitmentIndex(
  levels: number,
  leaves: string[],
  targetRoot: string,
  commitment: string
): Promise<{ provingLeaves: HexString[]; leafIndex: number }> {
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

import type { Hex } from 'viem';

export type NeighborEdge = {
  chainID: bigint;
  root: bigint;
  latestLeafIndex: bigint;
  srcResourceID: Hex;
};

export type ZKPInputWithoutMerkleProof = {
  nullifierHash: string;
  relayer: string;
  recipient: string;
  fee: number;
  refund: number;
  nullifier: string;
  secret: string;
};
export type ZKPInput = {
  /// merkle proof
  root: string;
  pathElements: string[];
  pathIndices: number[];
} & ZKPInputWithoutMerkleProof;

import { HexString } from '@polkadot/util/types';

export interface IVAnchorPublicInputs {
  proof: HexString;
  roots: HexString[];
  inputNullifiers: HexString[];
  outputCommitments: [HexString, HexString];
  publicAmount: HexString;
  extDataHash: HexString;
}

export interface Groth16Proof {
  proof: {
    pi_a: [HexString, HexString];
    pi_b: [[HexString, HexString], [HexString, HexString]];
    pi_c: [HexString, HexString];
    curve: string;
    prococol: 'groth16';
  };
  publicSignals: string[];
}

export interface VAnchorGroth16ProofInput {
  roots: bigint[];
  chainID: bigint;
  inputNullifier: bigint[];
  outputCommitment: bigint[];
  publicAmount: bigint;
  extDataHash: bigint;

  inAmount: bigint[];
  inPrivateKey: bigint[];
  inBlinding: bigint[];
  inPathIndices: bigint[];
  inPathElements: bigint[][];

  // data for 2 transaction outputs
  outChainID: bigint[];
  outAmount: bigint[];
  outPubkey: bigint[];
  outBlinding: bigint[];
}

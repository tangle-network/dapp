import { BridgeWitnessInput } from '@webb-dapp/contracts/contracts/types';
import { fetchWasmForEdges, fetchKeyForEdges } from '@webb-dapp/apps/configs/ipfs/anchors';

const groth16 = require('snarkjs/src/groth16');
const zkey = require('snarkjs/src/zkey');

type MaxEdges = 1 | 2 | 3 | 4 | 5;

export const generateWitness = async (input: BridgeWitnessInput, maxEdges: MaxEdges) => {
  try {
    const wasmBuf = await fetchWasmForEdges(maxEdges);
    const witnessCalculator = await require('../utils/witness-calculator')(wasmBuf);
    const buff = await witnessCalculator.calculateWTNSBin(input, 0);
    return buff;
  } catch (e) {
    console.log({ snarkError: e });
  }
};

export const proofAndVerify = async (witness: any, maxEdges: MaxEdges) => {
  console.log(witness);
  const circuitKey = await fetchKeyForEdges(maxEdges);
  const res = await groth16.prove(circuitKey, witness);
  const vKey = await zkey.exportVerificationKey(circuitKey);
  const verificationResults = await groth16.verify(vKey, res.publicSignals, res.proof);
  if (verificationResults) {
    return res;
  } else {
    throw new Error('failed to create proof');
  }
};

import { fetchKeyForEdges, fetchWasmForEdges } from '@webb-dapp/apps/configs/ipfs/evm/anchors';
import { BridgeWitnessInput } from '@webb-dapp/contracts/contracts/types';

const snarkjs = require('snarkjs');
const groth16 = snarkjs.groth16;
const zkey = snarkjs.zkey;

type MaxEdges = 1 | 2 | 3 | 4 | 5;

export const zeroAddress = '0x0000000000000000000000000000000000000000';
export const ZERO = `ZERO`;

const isZero = (value: string | number) => {
  if (value === zeroAddress) {
    return true;
  }
  return value == ZERO;
};
export const generateWitness = async (input: BridgeWitnessInput, maxEdges: MaxEdges) => {
  try {
    const wasmBuf = await fetchWasmForEdges(maxEdges);
    const witnessCalculator = await require('../utils/witness-calculator')(wasmBuf);
    const buff = await witnessCalculator.calculateWTNSBin(input, 0);
    return buff;
  } catch (e) {
    console.log({ snarkError: e });
    throw new Error('failed to generate witness');
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

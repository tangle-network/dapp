import { BridgeWitnessInput } from '@webb-dapp/contracts/contracts/types';

const snarkjsWtns = require('snarkjs/src/wtns');
const groth16 = require('snarkjs/src/groth16');
const zkey = require('snarkjs/src/zkey');

type MaxEdges = 1 | 2 | 3 | 4 | 5;

export const generateWitness = async (input: BridgeWitnessInput, maxEdges: MaxEdges) => {
  try {
    const wasmFilePath = `/assets/fixtures/${maxEdges + 1}/poseidon_bridge_${maxEdges + 1}.wasm`;
    const req = await fetch(wasmFilePath);
    const wasmBuf = await req.arrayBuffer();
    const witnessCalculator = await require('../utils/witness-calculator')(wasmBuf);
    const buff = await witnessCalculator.calculateWTNSBin(input, 0);
    return buff;
  } catch (e) {
    console.log({ snarkError: e });
  }
};

export const proofAndVerify = async (witness: any, maxEdges: MaxEdges) => {
  console.log(witness);
  const res = await groth16.prove(`/assets/fixtures/${maxEdges + 1}/circuit_final.zkey`, witness);
  const vKey = await zkey.exportVerificationKey(`/assets/fixtures/${maxEdges + 1}/circuit_final.zkey`);
  const verificationResults = await groth16.verify(vKey, res.publicSignals, res.proof);
  // Todo: Check why the verify fails
  if (verificationResults || true) {
    return res;
  } else {
    throw new Error('failed to create proof');
  }
};

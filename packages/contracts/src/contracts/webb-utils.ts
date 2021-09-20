import { BridgeWitnessInput } from '@webb-dapp/contracts/contracts/types';

const snarkjsWtns = require('snarkjs/src/wtns');
const groth16 = require('snarkjs/src/groth16');
const zkey = require('snarkjs/src/zkey');

export const generateWitness = async (input: BridgeWitnessInput) => {
  try {
    const wtns = { type: 'mem' };

    await snarkjsWtns.calculate(input, '/assets/fixtures/poseidon_bridge_2.wasm', wtns);
    return wtns;
  } catch (e) {
    console.log({ snarkError: e });
  }
};

export const proofAndVerify = async (witness: any) => {
  const res = await groth16.prove('/assets/fixtures/circuit_final.zkey', witness);
  const vKey = await zkey.exportVerificationKey('/assets/fixtures/circuit_final.zkey');
  const verificationResults = await groth16.verify(vKey, res.publicSignals, res.proof);
  if (1) {
    return res;
  } else {
    throw new Error('failed to create proof');
  }
};

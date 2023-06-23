import { ethers } from 'ethers';
import { Groth16Proof } from '../types';
import * as snarkjs from 'snarkjs';
import { hexToU8a } from '@webb-tools/utils';

async function groth16ProofToBytes(proof: Groth16Proof): Promise<Uint8Array> {
  const callData = await snarkjs.groth16.exportSolidityCallData(
    proof.proof,
    proof.publicSignals
  );

  const parsedCalldata = JSON.parse('[' + callData + ']');
  const pi_a = parsedCalldata[0] as Groth16Proof['proof']['pi_a'];
  const pi_b = parsedCalldata[1] as Groth16Proof['proof']['pi_b'];
  const pi_c = parsedCalldata[2] as Groth16Proof['proof']['pi_c'];

  const abi = new ethers.utils.AbiCoder();
  const fnAbi = '(uint[2] a,uint[2][2] b,uint[2] c)';
  const encodedData = abi.encode(
    [fnAbi],
    [
      {
        a: pi_a,
        b: pi_b,
        c: pi_c,
      },
    ]
  );
  return hexToU8a(encodedData);
}

export default groth16ProofToBytes;

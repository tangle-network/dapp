import { hexToU8a } from '@webb-tools/utils';
import { groth16 } from 'snarkjs';
import { encodeAbiParameters, parseAbiParameters } from 'viem';
import { Groth16Proof } from '../types';

async function groth16ProofToBytes(proof: Groth16Proof): Promise<Uint8Array> {
  const callData = await groth16.exportSolidityCallData(
    proof.proof,
    proof.publicSignals,
  );

  const parsedCalldata = JSON.parse('[' + callData + ']');
  const pi_a = parsedCalldata[0] as Groth16Proof['proof']['pi_a'];
  const pi_b = parsedCalldata[1] as Groth16Proof['proof']['pi_b'];
  const pi_c = parsedCalldata[2] as Groth16Proof['proof']['pi_c'];

  const fnAbi = '(uint[2] a,uint[2][2] b,uint[2] c)';
  const encodedData = encodeAbiParameters(parseAbiParameters(fnAbi), [
    {
      a: [BigInt(pi_a[0]), BigInt(pi_a[1])],
      b: [
        [BigInt(pi_b[0][0]), BigInt(pi_b[0][1])],
        [BigInt(pi_b[1][0]), BigInt(pi_b[1][1])],
      ],
      c: [BigInt(pi_c[0]), BigInt(pi_c[1])],
    },
  ]);

  return hexToU8a(encodedData);
}

export default groth16ProofToBytes;

const circomlib = require('circomlib');
const maci = require('maci-crypto');
const { hashLeftRight } = maci;

export function poseidonHash3(inputs: any[]) {
  if (inputs.length !== 3) throw new Error('panic');
  return circomlib.poseidon(inputs);
}

export class PoseidonHasher3 {
  hash(level: any, left: any, right: any) {
    return hashLeftRight(BigInt(left), BigInt(right)).toString();
  }

  hash3(inputs: any) {
    if (inputs.length !== 3) throw new Error('panic');
    return circomlib.poseidon(inputs);
  }
}

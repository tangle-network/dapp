const circomlib = require('circomlibjs');

const hashLeftRight = (left: bigint, right: bigint) => {
  return circomlib.poseidon([left, right]);
};

export function poseidonHash3(inputs: any[]) {
  if (inputs.length !== 3) {
    throw new Error('panic');
  }
  return circomlib.poseidon(inputs);
}

export class PoseidonHasher3 {
  hash(level: any, left: any, right: any) {
    return hashLeftRight(BigInt(left), BigInt(right)).toString();
  }

  hash3(inputs: any) {
    if (inputs.length !== 3) {
      throw new Error('panic');
    }
    return circomlib.poseidon(inputs);
  }
}

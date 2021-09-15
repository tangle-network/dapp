const circomlib = require('circomlib');

export function poseidonHash3(inputs: any[]) {
  if (inputs.length !== 3) throw new Error('panic');
  return circomlib.poseidon(inputs);
}

const circomlib = require('circomlib');
const mimcsponge = circomlib.mimcsponge;

export class MimcSpongeHasher {
  hash(level, left, right) {
    return mimcsponge.multiHash([BigInt(left), BigInt(right)]).toString();
  }
}


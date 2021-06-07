const circomlib = require('circomlib');
const mimcsponge = circomlib.mimcsponge;

export class MimcSpongeHasher {
  hash(level: any, left: any, right: any) {
    return mimcsponge.multiHash([BigInt(left), BigInt(right)]).toString();
  }
}

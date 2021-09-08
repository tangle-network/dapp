import { Hasher } from './merkle-tree';

const circomlib = require('tornado-circomlib');
const mimcsponge = circomlib.mimcsponge;

export class MimcSpongeHasher implements Hasher {
  hash(level: any, left: any, right: any) {
    return mimcsponge.multiHash([BigInt(left), BigInt(right)]).toString();
  }
}

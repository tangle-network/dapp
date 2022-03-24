import { Hasher } from './merkle-tree';
import { poseidon } from 'circomlibjs';

const hashLeftRight = (left: bigint, right: bigint) => {
  return poseidon([left, right]);
};
export class PoseidonHasher implements Hasher {
  hash(level: any, left: any, right: any): string {
    return hashLeftRight(BigInt(left), BigInt(right)).toString();
  }
}

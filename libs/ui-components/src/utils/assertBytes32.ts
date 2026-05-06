import assert from 'assert';
import { Bytes32 } from '../types/address';
import { isHex } from 'viem';

export const assertBytes32 = (value: string): Bytes32 => {
  assert(isHex(value), 'Input should be a hex string');
  assert(value.length === 66, 'Input should be 32 bytes in length');

  return value as Bytes32;
};

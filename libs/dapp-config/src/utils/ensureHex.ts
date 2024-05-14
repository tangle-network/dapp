import { HexString } from '@polkadot/util/types';
import { AddressType } from '../types.js';

const ensureHex = (maybeHex: string): HexString => {
  if (maybeHex.startsWith('0x')) {
    return maybeHex as AddressType;
  }

  return `0x${maybeHex}`;
};

export default ensureHex;

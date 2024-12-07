import { HexString } from '@polkadot/util/types';
import { Hex } from 'viem';

const ensureHex = (maybeHex: string): HexString => {
  if (maybeHex.startsWith('0x')) {
    return maybeHex as Hex;
  }

  return `0x${maybeHex}`;
};

export default ensureHex;

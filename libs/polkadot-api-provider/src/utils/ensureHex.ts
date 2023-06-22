import { HexString } from '@polkadot/util/types';

const ensureHex = (maybeHex: string): HexString => {
  if (maybeHex.startsWith('0x')) {
    return maybeHex as `0x${string}`;
  }

  return `0x${maybeHex}`;
};

export default ensureHex;

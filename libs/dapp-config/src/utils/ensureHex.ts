import { Hex } from 'viem';

const ensureHex = (maybeHex: string): Hex => {
  if (maybeHex.startsWith('0x')) {
    return maybeHex as Hex;
  }

  return `0x${maybeHex}` as Hex;
};

export default ensureHex;

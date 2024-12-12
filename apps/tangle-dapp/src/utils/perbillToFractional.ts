import { Perbill } from '@polkadot/types/interfaces';

const perbillToFractional = (perbill: Perbill): number => {
  return perbill.toNumber() / 1_000_000_000;
};

export default perbillToFractional;

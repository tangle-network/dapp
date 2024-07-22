import { Permill } from '@polkadot/types/interfaces';

const permillToPercentage = (permill: Permill) => {
  return permill.toNumber() / 1_000_000;
};

export default permillToPercentage;

import { BN } from '@polkadot/util';

const scaleAmountByPermill = (amount: BN, permill: number): BN => {
  // Scale factor for 4 decimal places (0.xxxx).
  const scale = new BN(10_000);

  // Scale the permill to an integer.
  const scaledPermill = new BN(Math.round(permill * scale.toNumber()));

  // Multiply the amount by the scaled permill and then divide by the scale.
  return amount.mul(scaledPermill).div(scale);
};

export default scaleAmountByPermill;

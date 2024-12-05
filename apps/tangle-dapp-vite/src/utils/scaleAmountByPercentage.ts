import { BN } from '@polkadot/util';

const scaleAmountByPercentage = (amount: BN, percentage: number): BN => {
  // Scale factor for 4 decimal places (0.xxxx).
  const scale = new BN(10_000);

  // Scale the percentage to an integer.
  const scaledPercentage = new BN(Math.round(percentage * scale.toNumber()));

  // Multiply the amount by the scaled percentage and then divide by the scale.
  return amount.mul(scaledPercentage).div(scale);
};

export default scaleAmountByPercentage;

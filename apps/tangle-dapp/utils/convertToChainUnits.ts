import { BN } from '@polkadot/util';

const convertToChainUnits = (amount: number, decimals: number): BN => {
  if (amount < 0) {
    throw new Error('Amount cannot be negative');
  }

  // Convert the amount to a string to avoid floating point inaccuracies.
  const amountStr = amount.toString();

  const [whole, fraction = ''] = amountStr.split('.');

  // Pad the fractional part with zeros to match the decimals length.
  const fractionPadded = fraction.padEnd(decimals, '0');

  const fullAmountStr = whole + fractionPadded;

  return new BN(fullAmountStr);
};

export default convertToChainUnits;

import { BN } from '@polkadot/util';

export enum ChainUnitParsingError {
  EmptyAmount,
  ExceedsDecimals,
}

/**
 * Converts a numeric amount in string form to blockchain format
 * based on the provided number of decimal places.
 *
 * This handles the conversion of a floating-point number into a
 * Big Number (BN), which is required for blockchain transactions.
 *
 * This is useful, for example, for when converting an user-inputted
 * amount to its BN representation.
 *
 * @remarks
 * An empty input is not supported, and will return an error.
 */
const parseChainUnits = (
  amountString: string,
  decimals: number,
): BN | ChainUnitParsingError => {
  let seenPeriod = false;

  const cleanAmount = amountString
    .split('')
    .filter((char) => {
      if (char === '.' && !seenPeriod) {
        seenPeriod = true;

        return true;
      }

      // Only allow digits.
      return char.match(/\d/);
    })
    .join('');

  if (cleanAmount.length === 0) {
    return ChainUnitParsingError.EmptyAmount;
  }

  const [wholePart, fractionPart = ''] = cleanAmount.split('.');

  // Check if the given amount has more decimal places than expected.
  if (fractionPart.length > decimals) {
    return ChainUnitParsingError.ExceedsDecimals;
  }

  // Pad the fraction part with zeroes to match the expected number
  // of decimal places. This is equivalent to multiplying the amount
  // by 10^decimals. For example, if the given decimals is 18, then
  // the amount 1.23 will be converted to 1.23*10^18.
  const fractionPartPadded = fractionPart.padEnd(decimals, '0');

  // Unite the whole and fraction parts into a single string.
  return new BN(`${wholePart}${fractionPartPadded}`);
};

export default parseChainUnits;

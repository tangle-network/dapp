import { BN, formatBalance } from '@polkadot/util';

import addCommasToNumber from './addCommasToNumber';

/**
 * When the user inputs an amount in the UI, say using an Input
 * component, the amount needs to be treated as if it were in chain
 * units.
 *
 * For example, this ensures that when he user inputs `1`, they mean
 * `1` token, and not the smallest unit possible.
 *
 * To have the amount be in proper form, it needs to be multiplied by
 * this factor (input amount * 10^decimals).
 */
const getChainUnitFactor = (decimals: number) => {
  return new BN(10).pow(new BN(decimals));
};

export type FormatOptions = {
  includeCommas: boolean;
  fractionMaxLength?: number;
  trimTrailingZeroes: boolean;
  withSi?: boolean;
};

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  fractionMaxLength: 4,
  includeCommas: false,
  trimTrailingZeroes: true,
  withSi: false,
};

// TODO: Break this function down into smaller local functions for improved legibility and modularity, since its logic is getting complex. Consider making it functional instead of modifying the various variables: Return {integerPart, fractionalPart} per transformation/function, so that it can be easily chainable monad-style. Also, prefer usage of Decimal.js instead of BN for better decimal handling without needing to manually handle the edge cases.
function formatBn(
  amount: BN,
  decimals: number,
  partialOptions?: Partial<FormatOptions>,
): string {
  const options: FormatOptions = {
    ...DEFAULT_FORMAT_OPTIONS,
    ...partialOptions,
  };

  if (options.withSi) {
    // Replace the space with an empty string to remove the
    // space between the number and the SI unit.
    return formatBalance(amount, {
      decimals,
      withSi: true,
      withUnit: false,
      withZero: false,
    }).replace(' ', '');
  }

  const chainUnitFactorBn = getChainUnitFactor(decimals);
  const isNegative = amount.isNeg();

  // There's a weird bug with BN.js, so need to create a new BN
  // instance here for the amount, to avoid a strange error.
  const integerPartBn = new BN(amount.toString()).div(chainUnitFactorBn);

  const remainderBn = amount.mod(chainUnitFactorBn);
  let integerPart = integerPartBn.abs().toString(10);
  let fractionPart = remainderBn.abs().toString(10).padStart(decimals, '0');
  const amountStringLength = amount.toString().length;
  const partsLength = integerPart.length + fractionPart.length;

  // Special case: If the integer part is 0, and options don't specify a
  // fraction max length, then don't use the default value for the fraction
  // max length. Instead keep it undefined. This is so that small, fractional
  // amounts are always shown, which would otherwise be cut-off and shown as '0'.
  if (integerPart === '0' && partialOptions?.fractionMaxLength === undefined) {
    options.fractionMaxLength = undefined;
  }

  // Check for missing leading zeros in the fraction part. This
  // edge case can happen when the remainder has fewer digits
  // than the specified decimals, resulting in a loss of leading
  // zeros when converting to a string, ex. 0001 -> 1.
  if (amountStringLength !== partsLength) {
    // Count how many leading zeros are missing.
    const missingZerosCount = amountStringLength - partsLength;

    // Add the missing leading zeros. Use the max function to avoid
    // strange situations where the count is negative (ie. the length
    // of the number is greater than the length of the integer and fraction
    // parts combined).
    fractionPart = '0'.repeat(Math.max(missingZerosCount, 0)) + fractionPart;
  }

  // Pad the end of the fraction part with zeros if applicable,
  // ex. 0.001 -> 0.0010 when the requested fraction length is 4.
  if (!options.trimTrailingZeroes) {
    fractionPart = fractionPart.padEnd(
      options.fractionMaxLength ?? decimals,
      '0',
    );
  }

  // Trim the fraction part to the desired length.
  if (options.fractionMaxLength !== undefined) {
    fractionPart = fractionPart.substring(0, options.fractionMaxLength);
  }

  // Remove trailing zeroes if applicable.
  if (options.trimTrailingZeroes) {
    while (fractionPart.endsWith('0')) {
      fractionPart = fractionPart.substring(0, fractionPart.length - 1);
    }
  }

  // Insert commas in the integer part if requested.
  if (options.includeCommas) {
    integerPart = addCommasToNumber(integerPart);
  }

  const polarity = isNegative ? '-' : '';

  // Combine the integer and fraction parts. Only include the fraction
  // part if it's available.
  return fractionPart !== ''
    ? `${polarity}${integerPart}.${fractionPart}`
    : `${polarity}${integerPart}`;
}

export default formatBn;
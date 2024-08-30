import { BN } from '@polkadot/util';

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
};

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  fractionMaxLength: 4,
  includeCommas: false,
  trimTrailingZeroes: true,
};

function formatBn(
  amount: BN,
  decimals: number,
  options?: Partial<FormatOptions>,
): string {
  const finalOptions: FormatOptions = { ...DEFAULT_FORMAT_OPTIONS, ...options };
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
  if (!finalOptions.trimTrailingZeroes) {
    fractionPart = fractionPart.padEnd(
      finalOptions.fractionMaxLength ?? decimals,
      '0',
    );
  }

  // Trim the fraction part to the desired length.
  if (finalOptions.fractionMaxLength !== undefined) {
    fractionPart = fractionPart.substring(0, finalOptions.fractionMaxLength);
  }

  // Remove trailing zeroes if applicable.
  if (finalOptions.trimTrailingZeroes) {
    while (fractionPart.endsWith('0')) {
      fractionPart = fractionPart.substring(0, fractionPart.length - 1);
    }
  }

  // Insert commas in the integer part if requested.
  if (finalOptions.includeCommas) {
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

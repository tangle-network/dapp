import { BN } from '@polkadot/util';

import { addCommasToInteger } from './addCommasToInteger';

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
  fractionLength?: number;
  padZerosInFraction: boolean;
};

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  fractionLength: 4,
  includeCommas: true,
  padZerosInFraction: false,
};

function formatBn(
  amount: BN,
  decimals: number,
  options?: Partial<FormatOptions>,
): string {
  const finalOptions = { ...DEFAULT_FORMAT_OPTIONS, ...options };
  const chainUnitFactorBn = getChainUnitFactor(decimals);
  const integerPartBn = amount.div(chainUnitFactorBn);
  const remainderBn = amount.mod(chainUnitFactorBn);

  let integerPart = integerPartBn.toString(10);
  let decimalPart = remainderBn.toString(10);

  // Check for missing leading zeros in the decimal part. This
  // edge case can happen when the remainder has fewer digits
  // than the specified decimals, resulting in a loss of leading
  // zeros when converting to a string, ex. 0001 -> 1.
  if (amount.toString().length !== (integerPart + decimalPart).length) {
    // Count how many leading zeros are missing.
    const missing0sCount =
      amount.toString().length - (integerPart + decimalPart).length;

    // Add the missing leading zeros.
    decimalPart = '0'.repeat(missing0sCount) + decimalPart;
  }

  if (finalOptions.padZerosInFraction) {
    decimalPart = decimalPart.padStart(decimals, '0');
  }

  // Trim the decimal part to the desired length.
  if (finalOptions.fractionLength !== undefined) {
    decimalPart = decimalPart.substring(0, finalOptions.fractionLength);
  }

  // Remove trailing 0s.
  while (decimalPart.endsWith('0')) {
    decimalPart = decimalPart.substring(0, decimalPart.length - 1);
  }

  // Insert commas in the integer part if requested.
  if (finalOptions.includeCommas) {
    integerPart = addCommasToInteger(integerPart);
  }

  // Combine the integer and decimal parts. Only include the decimal
  // part if it's available.
  return decimalPart !== '' ? `${integerPart}.${decimalPart}` : integerPart;
}

export default formatBn;

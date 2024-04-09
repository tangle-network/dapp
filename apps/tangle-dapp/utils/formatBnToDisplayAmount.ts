import { BN } from '@polkadot/util';

import { TANGLE_TOKEN_DECIMALS } from '../constants';

/**
 * When the user inputs an amount in the UI, say using an Input
 * component, the amount needs to be treated as if it were in chain
 * units (18 decimals).
 *
 * For example, this ensures that when he user inputs `1`, they mean
 * `1` token, and not the smallest unit possible.
 *
 * To have the amount be in proper form, it needs to be multiplied by
 * this factor (input amount * 10^18).
 */
export const CHAIN_UNIT_CONVERSION_FACTOR = new BN(10).pow(
  new BN(TANGLE_TOKEN_DECIMALS)
);

export type FormatOptions = {
  includeCommas: boolean;
  fractionLength?: number;
  padZerosInFraction: boolean;
};

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  includeCommas: false,
  padZerosInFraction: false,
};

function formatBnToDisplayAmount(
  amount: BN,
  options?: Partial<FormatOptions>
): string {
  const finalOptions = { ...DEFAULT_FORMAT_OPTIONS, ...options };
  const divisor = CHAIN_UNIT_CONVERSION_FACTOR;
  const divided = amount.div(divisor);
  const remainder = amount.mod(divisor);

  // Convert remainder to a string and pad with zeros if necessary.
  let remainderString = remainder.toString(10);

  if (finalOptions.padZerosInFraction) {
    remainderString = remainderString.padStart(TANGLE_TOKEN_DECIMALS, '0');
  }

  remainderString = remainderString.substring(0, finalOptions.fractionLength);

  // remove trailing 0s
  while (remainderString.endsWith('0')) {
    remainderString = remainderString.substring(0, remainderString.length - 1);
  }

  let integerPart = divided.toString(10);

  // Insert commas in the integer part if requested.
  if (finalOptions.includeCommas) {
    // TODO: Avoid using regex, it's confusing.
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // TODO: Make the condition explicit. Is it checking for an empty string?
  // Combine the integer and decimal parts.
  return remainderString ? `${integerPart}.${remainderString}` : integerPart;
}

export default formatBnToDisplayAmount;

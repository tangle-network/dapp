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

function convertChainUnitsToNumber(
  chainAmount: BN,
  includeCommas = false,
  fractionLength?: number
): string {
  const bnAmount = new BN(chainAmount);
  const divisor = CHAIN_UNIT_CONVERSION_FACTOR;
  const divided = bnAmount.div(divisor);
  const remainder = bnAmount.mod(divisor);

  // Convert remainder to a string and pad with zeros if necessary.
  const remainderString = remainder
    .toString(10)
    .padStart(TANGLE_TOKEN_DECIMALS, '0')
    .substring(0, fractionLength);

  let integerPart = divided.toString(10);

  // Insert commas in the integer part if requested.
  if (includeCommas) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Combine the integer and decimal parts.
  return remainderString ? `${integerPart}.${remainderString}` : integerPart;
}

export default convertChainUnitsToNumber;

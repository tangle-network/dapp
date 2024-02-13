import { BN } from '@polkadot/util';
import assert from 'assert';

import { TANGLE_TOKEN_DECIMALS } from '../constants';

/**
 * Converts a numeric amount to blockchain format based on the
 * specified decimals.
 *
 * This handles the conversion of a floating-point number into a
 * Big Number (BN), which is required for blockchain transactions.
 *
 * This is useful, for example, for when converting an user-inputted
 * amount to its BN representation.
 *
 * @remarks
 * This function does not support negative inputs.
 *
 * @example
 * ```ts
 * const amount = 123.456;
 * const convertedAmount = convertToChainUnits(amount);
 * console.log(convertedAmount.toString()); // Output will be a BN representation of 123.456 with 18 decimal places
 * ```
 */
const convertToChainUnits = (amount: number): BN => {
  assert(amount >= 0, 'Amount should be 0 or positive');

  // Convert the amount to a string to avoid floating point inaccuracies.
  const amountStr = amount.toString();

  const [whole, fraction = ''] = amountStr.split('.');

  // Pad the fractional part with zeros to match the decimals length.
  const fractionPadded = fraction.padEnd(TANGLE_TOKEN_DECIMALS, '0');

  const fullAmountStr = whole + fractionPadded;

  return new BN(fullAmountStr);
};

export default convertToChainUnits;

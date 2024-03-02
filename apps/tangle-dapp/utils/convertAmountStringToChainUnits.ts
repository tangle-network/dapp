import { BN } from '@polkadot/util';

import { TANGLE_TOKEN_DECIMALS } from '../constants';

/**
 * Converts a numeric amount in string form to blockchain format
 * based on the number of decimal places used in Tangle.
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
const convertAmountStringToChainUnits = (amount: string): BN => {
  // TODO: Use zod for validation, and convert this function to support input amount strings, as it is currently only used with strings & for user inputs.

  // Convert the amount to a string to avoid floating point inaccuracies.
  const amountStr = amount.toString();

  const [whole, fraction = ''] = amountStr.split('.');

  // Pad the fractional part with zeros to match the decimals length.
  const fractionPadded = fraction.padEnd(TANGLE_TOKEN_DECIMALS, '0');

  const fullAmountStr = whole + fractionPadded;

  return new BN(fullAmountStr);
};

export default convertAmountStringToChainUnits;

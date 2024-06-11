import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';

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
 * const amount = '123.456';
 * const convertedAmount = convertToChainUnits(amount);
 * console.log(convertedAmount.toString()); // Output will be a BN representation of 123.456 with 18 decimal places
 * ```
 */
const parseChainUnits = (amountString: string): BN => {
  // TODO: Use zod for validation, and convert this function to support input amount strings, as it is currently only used with strings & for user inputs.

  const [whole, fraction = ''] = amountString.split('.');

  // Pad the fractional part with zeros to match the decimals length.
  const fractionPadded = fraction.padEnd(TANGLE_TOKEN_DECIMALS, '0');

  const fullAmountString = whole + fractionPadded;

  return new BN(fullAmountString);
};

export default parseChainUnits;

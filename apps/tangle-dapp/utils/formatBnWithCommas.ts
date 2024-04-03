import { BN } from '@polkadot/util';

/**
 * Formats a BN value with commas every 3 digits.
 *
 * @example
 * ```ts
 * formatBnWithCommas(new BN('123456789')); // '123,456,789'
 * ```
 */
export const formatBnWithCommas = (bn: BN): string => {
  // TODO: Incorporate this into the logic of `formatBnToDisplayAmount` to consolidate balance formatting logic.

  const valueAsString = bn.toString();
  let result = '';
  let count = 0;

  // Iterate through the string representation of the value in reverse order.
  for (let i = valueAsString.length - 1; i >= 0; i--) {
    result = valueAsString[i] + result;
    count++;

    // Add a comma every 3 digits, except for the first digit.
    if (count % 3 === 0 && i !== 0) {
      result = ',' + result;
    }
  }

  return result;
};

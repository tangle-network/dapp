import { BN } from '@polkadot/util';

/**
 * Formats a BN value with commas every 3 digits.
 *
 * @example
 * ```ts
 * addCommasToInteger(new BN('123456789')); // '123,456,789'
 * ```
 */
const addCommasToNumber = (numberLike: BN | number | string): string => {
  const valueAsString = numberLike.toString();

  // Sanity check that the value is not already formatted.
  if (typeof numberLike === 'string' && numberLike.includes(',')) {
    console.warn('Attempted to add commas to a number that already has commas');

    return numberLike;
  }
  // This will format the number as a string with commas every 3 digits.
  else if (typeof numberLike === 'number') {
    return numberLike.toLocaleString('en-US');
  }

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

export default addCommasToNumber;

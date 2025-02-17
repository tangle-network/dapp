import { BN } from '@polkadot/util';
/**
 * Formats a BN value with commas every 3 digits.
 *
 * @example
 * ```ts
 * addCommasToInteger(new BN('123456789')); // '123,456,789'
 * ```
 */
declare const addCommasToNumber: (numberLike: BN | number | string) => string;
export default addCommasToNumber;

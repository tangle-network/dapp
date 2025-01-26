import { BN } from '@polkadot/util';
import assert from 'assert';
import { Decimal } from 'decimal.js';

/**
 * Given an amount, calculate its percentage of a total amount.
 *
 * The resulting percentage will be a Number with the requested decimal
 * places, ex. 0.67, ranging from 0 to 1.
 *
 * Because of the possible loss in precision, this utility function is
 * only suitable for use in the UI.
 *
 * @throws If the second argument is zero.
 */
function calculateBnRatio(a: BN, b: BN, decimalPlaces = 2): number {
  assert(
    !b.isZero(),
    'The second argument should not be zero, otherwise division by zero would occur',
  );

  assert(decimalPlaces >= 0, 'Decimal precision must be non-negative');

  if (a.isZero()) {
    return 0;
  }

  const decimalA = new Decimal(a.toString());
  const decimalB = new Decimal(b.toString());

  const ratio = decimalA
    .div(decimalB)
    // Truncate the decimal places to the requested precision
    // without rounding.
    .toDP(decimalPlaces + 2, Decimal.ROUND_FLOOR);

  return Number(ratio);
}

export default calculateBnRatio;

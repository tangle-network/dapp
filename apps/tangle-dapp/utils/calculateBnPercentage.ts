import { BN } from '@polkadot/util';
import assert from 'assert';

/**
 * Given an amount, calculate its percentage of a total amount.
 *
 * The resulting percentage will be a Number with 2 decimal places,
 * ex. `0.67`, ranging from 0 to 1.
 *
 * This is useful for integrating BN numbers into visual representation,
 * such as when working with Recharts to chart BN amount allocations,
 * since Recharts does not natively support BNs as data inputs.
 *
 * Because of the possible loss in precision, this utility function is
 * only suitable for use in the UI.
 */
function calculateBnPercentage(amount: BN, total: BN): number {
  assert(
    !total.isZero(),
    'Total should not be zero, otherwise division by zero would occur'
  );

  assert(amount.lte(total), 'Amount should be less than or equal to total');

  const scaledAmount = amount.muln(100);
  const percentageString = scaledAmount.div(total).toString();

  // Converting the string to a number ensures that the conversion to
  // number never fails, but it may result in a loss of precision for
  // extremely large values.
  const percentage = Number(percentageString) / 100;

  // Round the percentage to 2 decimal places. It's suitable to use
  // 2 decimal places since the purpose of this function is to provide
  // a visual representation of the percentage in the UI.
  return Math.round(percentage * 100) / 100;
}

export default calculateBnPercentage;

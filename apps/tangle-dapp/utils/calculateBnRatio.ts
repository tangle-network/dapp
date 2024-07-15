import { BN } from '@polkadot/util';
import assert from 'assert';

/**
 * Given an amount, calculate its percentage of a total amount.
 *
 * The resulting percentage will be a Number with the requested decimal
 * places, ex. `0.67`, ranging from 0 to 1.
 *
 * Because of the possible loss in precision, this utility function is
 * only suitable for use in the UI.
 */
function calculateBnRatio(a: BN, b: BN, decimalPrecision = 2): number {
  assert(
    !b.isZero(),
    'The second argument should not be zero, otherwise division by zero would occur',
  );

  const precisionFactor = 10 ** decimalPrecision;
  const scaledAmount = a.muln(precisionFactor);
  const percentageString = scaledAmount.div(b).toString();

  // Converting the string to a number ensures that the conversion to
  // number never fails, but it may result in a loss of precision for
  // extremely large values.
  const percentage = Number(percentageString) / precisionFactor;

  // Round the percentage to the requested decimal places.
  return Math.round(percentage * precisionFactor) / precisionFactor;
}

export default calculateBnRatio;
